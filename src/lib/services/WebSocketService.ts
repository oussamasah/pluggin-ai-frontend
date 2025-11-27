// lib/websocket/WebSocketService.ts
export type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

export type WebSocketEventHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectInterval = 1000;
  private maxReconnectInterval = 30000;
  private isConnecting = false;
  public isConnected = false;
  private connectionPromise: Promise<void> | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat = 0;
  private pendingMessages: WebSocketMessage[] = [];
  private userId: string | undefined ;

  // Backend health monitoring
  private isBackendAvailable = true;
  private backendCheckInterval: NodeJS.Timeout | null = null;
  private backendCheckCooldown = 10000;

  // Connection state callbacks
  private onConnectionChangeCallbacks: ((connected: boolean) => void)[] = [];
  private onReconnectCallbacks: (() => void)[] = [];

  constructor(private baseUrl: string = ""+ process.env.NEXT_PUBLIC_WS_URL) {
    // Development singleton
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      if ((window as any).webSocketServiceInstance) {
        return (window as any).webSocketServiceInstance;
      }
      (window as any).webSocketServiceInstance = this;
    }

    // Auto-reconnect when browser comes online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleBrowserOnline.bind(this));
      window.addEventListener('offline', this.handleBrowserOffline.bind(this));
    }
  }

  async connect(userId?: string): Promise<void> {
    // Check backend health before attempting connection
    if (!this.isBackendAvailable && this.reconnectAttempts > 0) {
      console.log('⏸️ Backend unavailable, skipping connection attempt');
      return;
    }
  
    if (this.connectionPromise) {
      console.log('🔄 Returning existing connection promise');
      return this.connectionPromise;
    }
  
    if (this.isConnected) {
      console.log('✅ WebSocket already connected');
      return;
    }
  
    if (this.isConnecting) {
      console.log('⏳ WebSocket connection in progress');
      return;
    }
  
    // Clear any pending reconnect
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  
    this.isConnecting = true;
    this.userId = userId || undefined;
    
    const wsUrl = `${this.baseUrl}/ws`;
    
    console.log('🔗 Attempting WebSocket connection...', {
      url: wsUrl,
      userId,
      reconnectAttempt: this.reconnectAttempts + 1,
      maxAttempts: this.maxReconnectAttempts,
      backendAvailable: this.isBackendAvailable
    });
  
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Clean up existing connection
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }
  
        console.log('🔄 Creating WebSocket connection to:', wsUrl);
        this.ws = new WebSocket(wsUrl);
        
        // Set connection timeout (10 seconds)
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.error('❌ WebSocket connection timeout');
            this.ws?.close();
            this.handleConnectionFailure('Connection timeout');
            reject(new Error('Connection timeout'));
          }
        }, 10000);
  
        this.ws.onopen = (event) => {
          clearTimeout(connectionTimeout);
          console.log('✅ WebSocket connected successfully to:', wsUrl);
          this.handleConnectionSuccess();
          resolve();
        };
  
        this.ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            
            // Handle heartbeat responses
            if (data.type === 'pong') {
              this.lastHeartbeat = Date.now();
              return;
            }
            
            console.log('📨 Received WebSocket message:', data);
            this.handleMessage(data);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };
  
        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('🔌 WebSocket disconnected:', {
            url: wsUrl,
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
          
          this.handleConnectionFailure('WebSocket closed', event.code);
        };
  
        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('❌ WebSocket connection error for URL:', wsUrl, error);
          this.handleConnectionFailure('WebSocket error');
          reject(error);
        };
  
      } catch (error) {
        console.error('❌ WebSocket connection setup error:', error);
        this.handleConnectionFailure('Connection error');
        reject(error);
      }
    });
  
    return this.connectionPromise;
  }

  private handleConnectionSuccess(): void {
    this.isConnecting = false;
    this.isConnected = true;
    this.isBackendAvailable = true;
    this.reconnectAttempts = 0;
    this.connectionPromise = null;
    
    // Stop backend health monitoring if it's running
    if (this.backendCheckInterval) {
      clearInterval(this.backendCheckInterval);
      this.backendCheckInterval = null;
    }
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Send pending messages
    this.flushPendingMessages();
    
    // Notify connection change
    this.notifyConnectionChange(true);
    
    // Trigger reconnect callbacks to refresh data
    this.notifyReconnect();
    
    // Join session if userId provided
    setTimeout(() => {
      if (this.userId && this.userId !== 'anonymous' && this.isConnected) {
        this.send({
          type: 'join-session',
          sessionId: this.userId
        });
      }
    }, 500);
  }

  private handleConnectionFailure(reason: string, code?: number): void {
    this.cleanup();
    this.notifyConnectionChange(false);
    
    // Don't reconnect for normal closures
    if (code === 1000 || code === 1001) {
      console.log('ℹ️ Normal WebSocket closure, not reconnecting');
      return;
    }
    
    this.handleReconnection();
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN && this.isConnected) {
      console.log('📤 Sending WebSocket message:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('❌ WebSocket not connected. Queueing message:', message);
      this.pendingMessages.push(message);
      
      // Try to reconnect if not already connecting
      if (!this.isConnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log('🔄 Triggering reconnection for queued message');
        this.connect(this.userId);
      }
    }
  }

  private handleMessage(data: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(data.type) || [];
    console.log(`🔄 Processing ${data.type} with ${handlers.length} handlers`);
    
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`❌ Error in handler for ${data.type}:`, error);
      }
    });
  }

  on(messageType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(messageType)) {
      this.eventHandlers.set(messageType, []);
    }
    this.eventHandlers.get(messageType)!.push(handler);
    console.log(`✅ Registered handler for ${messageType}`);
  }

  off(messageType: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Add connection state listener
  onConnectionChange(callback: (connected: boolean) => void): void {
    this.onConnectionChangeCallbacks.push(callback);
  }

  offConnectionChange(callback: (connected: boolean) => void): void {
    const index = this.onConnectionChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.onConnectionChangeCallbacks.splice(index, 1);
    }
  }

  // Add reconnect listener (called when connection is restored)
  onReconnect(callback: () => void): void {
    this.onReconnectCallbacks.push(callback);
  }

  offReconnect(callback: () => void): void {
    const index = this.onReconnectCallbacks.indexOf(callback);
    if (index > -1) {
      this.onReconnectCallbacks.splice(index, 1);
    }
  }

  private notifyConnectionChange(connected: boolean): void {
    this.onConnectionChangeCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection change callback:', error);
      }
    });
  }

  private notifyReconnect(): void {
    console.log('🔄 Notifying reconnect callbacks');
    this.onReconnectCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in reconnect callback:', error);
      }
    });
  }

  private async checkBackendHealth(): Promise<boolean> {
    try {
      // Try to fetch a simple health endpoint
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL+'/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const isHealthy = response.ok;
      this.isBackendAvailable = isHealthy;
      
      console.log(`🔍 Backend health check: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      return isHealthy;
    } catch (error) {
      console.log('🔴 Backend health check failed:', error);
      this.isBackendAvailable = false;
      return false;
    }
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      
      // Start periodic backend health checks
      this.startBackendHealthMonitoring();
      return;
    }

    this.reconnectAttempts++;
    
    // Exponential backoff with jitter
    const baseDelay = Math.min(
      this.baseReconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1),
      this.maxReconnectInterval
    );
    
    // Add jitter (±20%) to avoid thundering herd
    const jitter = baseDelay * 0.2 * (Math.random() - 0.5);
    const delay = Math.max(baseDelay + jitter, 1000);
    
    console.log(`🔄 Attempting to reconnect in ${Math.round(delay)}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      // Check backend health before reconnecting
      this.checkBackendHealth().then(isHealthy => {
        if (isHealthy) {
          this.connect(this.userId);
        } else {
          console.log('⏸️ Backend still unavailable, will retry later');
          // Continue with normal reconnection flow which will check again
          this.handleReconnection();
        }
      });
    }, delay);
  }

  private startBackendHealthMonitoring(): void {
    if (this.backendCheckInterval) {
      clearInterval(this.backendCheckInterval);
    }

    console.log('🔍 Starting backend health monitoring');
    
    this.backendCheckInterval = setInterval(async () => {
      const isHealthy = await this.checkBackendHealth();
      
      if (isHealthy) {
        console.log('✅ Backend is healthy again, resuming normal operation');
        this.isBackendAvailable = true;
        this.reconnectAttempts = 0; // Reset attempts
        
        // Stop health monitoring
        if (this.backendCheckInterval) {
          clearInterval(this.backendCheckInterval);
          this.backendCheckInterval = null;
        }
        
        // Attempt to reconnect
        this.connect(this.userId);
      }
    }, this.backendCheckCooldown);
  }

  private startHeartbeat(): void {
    // Clear existing heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.lastHeartbeat = Date.now();
        this.send({ type: 'ping' });
        
        // Check if we haven't received a pong in a while
        if (Date.now() - this.lastHeartbeat > 30000) { // 30 seconds without response
          console.warn('⚠️ No heartbeat response, forcing reconnect');
          this.handleReconnection();
        }
      }
    }, 15000); // Send ping every 15 seconds
  }

  private flushPendingMessages(): void {
    if (this.pendingMessages.length > 0) {
      console.log(`🔄 Flushing ${this.pendingMessages.length} pending messages`);
      
      // Send all pending messages
      this.pendingMessages.forEach(message => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(message));
        }
      });
      
      this.pendingMessages = [];
    }
  }

  private handleBrowserOnline(): void {
    console.log('🌐 Browser came online, attempting reconnect');
    if (!this.isConnected && !this.isConnecting) {
      this.connect(this.userId);
    }
  }

  private handleBrowserOffline(): void {
    console.log('🌐 Browser went offline');
    // The onclose event will handle the reconnection logic
  }

  private cleanup(): void {
    this.isConnecting = false;
    this.isConnected = false;
    this.connectionPromise = null;

    // Clear intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  disconnect(): void {
    console.log('🔌 Manually disconnecting WebSocket');
    
    // Clear all timeouts and intervals
    this.cleanup();
    
    // Clear pending messages
    this.pendingMessages = [];
    
    // Reset reconnect attempts
    this.reconnectAttempts = 0;
    
    // Close connection
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.notifyConnectionChange(false);
  }

  get status(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  // Additional utility methods
  getReconnectInfo(): { attempts: number; maxAttempts: number; backendAvailable: boolean } {
    return {
      attempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      backendAvailable: this.isBackendAvailable
    };
  }

  // Force immediate reconnection
  async forceReconnect(): Promise<void> {
    console.log('🔄 Force reconnecting WebSocket');
    this.disconnect();
    await this.connect(this.userId);
  }
}

export const webSocketService = new WebSocketService();