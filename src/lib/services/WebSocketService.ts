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
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private isConnecting = false;
  public isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(private baseUrl: string = 'ws://'+process.env.NEXT_PUBLIC_WS_URL) {
    // Development singleton
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      if ((window as any).webSocketServiceInstance) {
        return (window as any).webSocketServiceInstance;
      }
      (window as any).webSocketServiceInstance = this;
    }
  }

  async connect(userId?: string): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.isConnected || this.isConnecting) {
      console.log('⚠️ WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;
    console.log('🔗 Attempting WebSocket connection...');

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }

        this.ws = new WebSocket(`${this.baseUrl}/ws`);
        
        this.ws.onopen = (event) => {
          console.log('✅ WebSocket connected successfully');
          this.isConnecting = false;
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          
          setTimeout(() => {
            if (userId && userId !== 'anonymous' && this.isConnected) {
              this.send({
                type: 'join-session',
                sessionId: userId
              });
            }
          }, 500);
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log('📨 Received WebSocket message:', data);
            this.handleMessage(data);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
          
          this.isConnecting = false;
          this.isConnected = false;
          this.connectionPromise = null;
          this.ws = null;
          
          if (event.code !== 1000) {
            this.handleReconnection();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.isConnected = false;
          this.connectionPromise = null;
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        this.isConnected = false;
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN && this.isConnected) {
      console.log('📤 Sending WebSocket message:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('❌ WebSocket not connected. Cannot send message:', message);
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

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    console.log('🔌 Manually disconnecting WebSocket');
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.connectionPromise = null;
    this.reconnectAttempts = 0;
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
}

export const webSocketService = new WebSocketService();
