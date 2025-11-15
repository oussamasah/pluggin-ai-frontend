import React, { useEffect, useRef } from 'react';

const ShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Vertex shader source code
  const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
      gl_Position = aVertexPosition;
    }
  `;

  // Fragment shader source code - Modern Radar/Networking Style
  const fsSource = `
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;

    #define PRIMARY_COLOR vec3(0.6549, 0.9490, 0.0196) // #a7f205
    #define SECONDARY_COLOR vec3(0.1, 0.3, 0.05)
    #define BG_COLOR_1 vec3(0.02, 0.05, 0.08)
    #define BG_COLOR_2 vec3(0.01, 0.03, 0.06)
    #define GRID_COLOR vec3(0.15, 0.25, 0.1)
    
    const float PI = 3.14159265359;
    const float TAU = 6.28318530718;

    // Smooth HSV to RGB conversion
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    // 2D Random function
    float random (in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // 2D Noise function
    float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(a, b, u.x) + 
            (c - a)* u.y * (1.0 - u.x) + 
            (d - b) * u.x * u.y;
    }

    // Rotate function
    mat2 rotate2d(float angle){
      return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    }

    // Draw a circle with smooth edges
    float circle(vec2 uv, vec2 pos, float radius, float blur) {
      return smoothstep(radius + blur, radius, length(uv - pos));
    }

    // Draw a ring
    float ring(vec2 uv, vec2 pos, float radius, float width, float blur) {
      float d = length(uv - pos);
      return smoothstep(radius + width + blur, radius + width, d) - 
            smoothstep(radius - blur, radius, d);
    }

    // Draw a radar sweep
    float radarSweep(vec2 uv, float time) {
      vec2 centered = uv - 0.5;
      float angle = atan(centered.y, centered.x);
      float sweep = mod(angle + time * 2.0, TAU);
      float dist = length(centered);
      
      float sweepWidth = 0.3;
      float sweepGlow = exp(-sweep * 4.0) * 0.5;
      
      return sweepGlow * smoothstep(0.0, 0.5, dist) * (1.0 - smoothstep(0.4, 0.5, dist));
    }

    // Generate network nodes
    float networkNodes(vec2 uv, float time) {
      float nodeIntensity = 0.0;
      
      for(int i = 0; i < 8; i++) {
        float fi = float(i);
        float angle = fi * TAU / 8.0 + time * 0.5;
        float radius = 0.2 + sin(time * 0.3 + fi) * 0.05;
        
        vec2 nodePos = vec2(cos(angle), sin(angle)) * radius + 0.5;
        
        // Pulsing nodes
        float pulse = sin(time * 3.0 + fi * 2.0) * 0.5 + 0.5;
        float node = circle(uv, nodePos, 0.008 + pulse * 0.004, 0.002);
        nodeIntensity += node * (0.8 + pulse * 0.4);
        
        // Connection lines between nodes
        float nextAngle = angle + TAU / 8.0;
        vec2 nextNodePos = vec2(cos(nextAngle), sin(nextAngle)) * radius + 0.5;
        
        vec2 lineDir = normalize(nextNodePos - nodePos);
        vec2 toUV = uv - nodePos;
        float projection = dot(toUV, lineDir);
        vec2 closest = nodePos + lineDir * clamp(projection, 0.0, length(nextNodePos - nodePos));
        float lineDist = length(uv - closest);
        
        float connection = smoothstep(0.003, 0.001, lineDist) * 
                          smoothstep(0.0, 0.1, projection) * 
                          smoothstep(length(nextNodePos - nodePos), 
                                   length(nextNodePos - nodePos) - 0.1, projection);
        nodeIntensity += connection * 0.3;
      }
      
      return nodeIntensity;
    }

    // Generate data streams
    float dataStreams(vec2 uv, float time) {
      float streams = 0.0;
      vec2 centered = uv - 0.5;
      
      for(int i = 0; i < 4; i++) {
        float fi = float(i);
        float streamAngle = fi * TAU / 4.0 + time * 0.2;
        vec2 streamDir = vec2(cos(streamAngle), sin(streamAngle));
        
        float distFromCenter = dot(centered, streamDir);
        float perpendicularDist = length(centered - streamDir * distFromCenter);
        
        if(distFromCenter > 0.0) {
          float speed = 2.0 + fi * 0.5;
          float pulse = sin((distFromCenter - time * speed) * 20.0) * 0.5 + 0.5;
          float stream = smoothstep(0.02, 0.01, perpendicularDist) * 
                        pulse * 
                        exp(-distFromCenter * 2.0) *
                        smoothstep(0.0, 0.1, distFromCenter);
          streams += stream;
        }
      }
      
      return streams;
    }

    // Generate hexagon grid
    float hexagonGrid(vec2 uv, float time) {
      uv *= 8.0;
      
      vec2 grid = fract(uv) - 0.5;
      vec2 id = floor(uv);
      
      // Create hexagonal pattern
      float hex = max(abs(grid.x), abs(grid.y * 1.5));
      float hexLine = smoothstep(0.45, 0.43, hex);
      
      // Animate some hexagons
      float pulse = sin(time * 2.0 + id.x * 0.5 + id.y * 0.3) * 0.5 + 0.5;
      float animatedHex = hexLine * pulse * 0.3;
      
      return animatedHex * 0.1;
    }

    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec2 uv = fragCoord.xy / iResolution.xy;
      vec2 centeredUV = uv - 0.5;
      float aspect = iResolution.x / iResolution.y;
      centeredUV.x *= aspect;
      
      // Background gradient
      vec3 bg = mix(BG_COLOR_1, BG_COLOR_2, uv.y);
      
      // Hexagon grid in background
      float grid = hexagonGrid(uv, iTime);
      bg += grid * GRID_COLOR * 0.3;
      
      // Main radar rings
      float rings = 0.0;
      for(int i = 1; i <= 3; i++) {
        float radius = 0.15 * float(i);
        rings += ring(centeredUV, vec2(0.0), radius, 0.002, 0.001) * 0.5;
      }
      
      // Radar sweep
      float sweep = radarSweep(uv, iTime);
      
      // Network nodes and connections
      float nodes = networkNodes(uv, iTime);
      
      // Data streams
      float streams = dataStreams(centeredUV, iTime);
      
      // Combine all elements
      vec3 finalColor = bg;
      finalColor += rings * PRIMARY_COLOR;
      finalColor += sweep * PRIMARY_COLOR * 2.0;
      finalColor += nodes * PRIMARY_COLOR * 1.5;
      finalColor += streams * PRIMARY_COLOR * 0.8;
      
      // Add some subtle noise for texture
      float grain = noise(uv * 500.0 + iTime) * 0.02;
      finalColor += grain;
      
      // Vignette effect
      float vignette = 1.0 - smoothstep(0.0, 0.7, length(centeredUV));
      finalColor *= vignette;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  // Helper function to compile shader
  const loadShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error: ', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  // Initialize shader program
  const initShaderProgram = (gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram | null => {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const shaderProgram = gl.createProgram();
    if (!shaderProgram) return null;

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Shader program link error: ', gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.warn('WebGL not supported.');
      return;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) {
      console.error('Failed to initialize shader program');
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
        time: gl.getUniformLocation(shaderProgram, 'iTime'),
      },
    };

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const render = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const currentTime = (timestamp - startTimeRef.current) / 1000;

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(programInfo.program);

      gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
      gl.uniform1f(programInfo.uniformLocations.time, currentTime);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(render);
    };

    // Start animation loop
    animationRef.current = requestAnimationFrame(render);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      
      // Clean up WebGL resources
      if (positionBuffer) {
        gl.deleteBuffer(positionBuffer);
      }
      if (shaderProgram) {
        gl.deleteProgram(shaderProgram);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ 
        display: 'block',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)'
      }}
    />
  );
};

export default ShaderBackground;