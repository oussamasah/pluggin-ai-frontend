// components/ui/web-gl-shader-chat.tsx
'use client'

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function WebGLShaderChat() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene | null
    camera: THREE.OrthographicCamera | null
    renderer: THREE.WebGLRenderer | null
    mesh: THREE.Mesh | null
    uniforms: any
    animationId: number | null
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    uniforms: null,
    animationId: null,
  })

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const { current: refs } = sceneRef

    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
       
        // Create multiple moving lines with different speeds and directions
        const float lineCount = 8.0; // Must be constant for WebGL
        float lineSpacing = 0.15;
        float lineThickness = 0.003;
        
        vec3 color = vec3(0.0);
        
        // Use constant loop with hardcoded count
        for(float i = 0.0; i < 8.0; i++) {
          // Different speeds and phases for each line
          float speed = 0.5 + i * 0.1;
          float phase = i * 0.8;
          float offset = i * lineSpacing;
          
          // Create horizontal lines that move vertically
          float linePos = sin(p.x * xScale * (1.0 + i * 0.3) + time * speed + phase) * yScale;
          float line = smoothstep(lineThickness, 0.0, abs(p.y - linePos - offset));
          
          // Add vertical lines that move horizontally
          float vertLinePos = cos(p.y * yScale * (1.0 + i * 0.2) + time * speed * 0.7 + phase) * xScale;
          float vertLine = smoothstep(lineThickness, 0.0, abs(p.x - vertLinePos - offset));
          
          // Diagonal lines
          float diagonal = p.x * 0.7 + p.y * 0.7 + time * speed * 0.5 + phase;
          float diagLine = smoothstep(lineThickness * 2.0, 0.0, abs(fract(diagonal * 4.0) - 0.5));
          
          // Combine all line types
          float combinedLines = max(line, max(vertLine, diagLine));
          
          // Different colors for different line groups
          vec3 lineColor;
          if (i < 2.0) {
            lineColor = vec3(0.1, 0.8, 0.3); // Bright green
          } else if (i < 5.0) {
            lineColor = vec3(0.05, 0.6, 0.2); // Medium green
          } else {
            lineColor = vec3(0.02, 0.4, 0.1); // Dark green
          }
          
          color += combinedLines * lineColor * (0.8 + 0.4 * sin(time * 0.5 + i));
        }
        
        // Add some pulsing dots along the lines
        float dotPattern = sin(p.x * 20.0 + time * 2.0) * sin(p.y * 15.0 + time * 1.5);
        float dots = smoothstep(0.7, 0.9, dotPattern) * 0.3;
        color += dots * vec3(0.2, 1.0, 0.4);
        
        // Add grid-like structure
        float gridX = smoothstep(0.002, 0.0, abs(fract(p.x * 8.0) - 0.5));
        float gridY = smoothstep(0.002, 0.0, abs(fract(p.y * 6.0) - 0.5));
        color += (gridX + gridY) * 0.1 * vec3(0.1, 0.5, 0.2);
        
        // Add some subtle noise for texture
        float noise = fract(sin(dot(p + time * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
        color += noise * 0.05;
        
        // Edge fade
        float edgeFade = 1.0 - smoothstep(0.8, 1.5, length(p));
        color *= edgeFade;
        
        // Add glow to lines
        float glow = length(color) * 0.4;
        color += glow * vec3(0.1, 0.6, 0.2);

        gl_FragColor = vec4(color, 0.6);
      }
    `

    const initScene = () => {
      refs.scene = new THREE.Scene()
      refs.renderer = new THREE.WebGLRenderer({ 
        canvas,
        alpha: true,
        antialias: true 
      })
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      refs.renderer.setClearColor(new THREE.Color(0x000000), 0)

      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

      refs.uniforms = {
        resolution: { value: [window.innerWidth, window.innerHeight] },
        time: { value: 0.0 },
        xScale: { value: 3.0 },
        yScale: { value: 0.4 },
        distortion: { value: 0.1 },
      }

      const position = [
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
      ]

      const positions = new THREE.BufferAttribute(new Float32Array(position), 3)
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", positions)

      const material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: refs.uniforms,
        side: THREE.DoubleSide,
        transparent: true,
      })

      refs.mesh = new THREE.Mesh(geometry, material)
      refs.scene.add(refs.mesh)

      handleResize()
    }

    const animate = () => {
      if (refs.uniforms) refs.uniforms.time.value += 0.008
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera)
      }
      refs.animationId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms) return
      const width = window.innerWidth
      const height = window.innerHeight
      refs.renderer.setSize(width, height, false)
      refs.uniforms.resolution.value = [width, height]
    }

    initScene()
    animate()
    window.addEventListener("resize", handleResize)

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId)
      window.removeEventListener("resize", handleResize)
      if (refs.mesh) {
        refs.scene?.remove(refs.mesh)
        refs.mesh.geometry.dispose()
        if (refs.mesh.material instanceof THREE.Material) {
          refs.mesh.material.dispose()
        }
      }
      refs.renderer?.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full block pointer-events-none opacity-70"
    />
  )
}