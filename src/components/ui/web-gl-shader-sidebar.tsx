// components/ui/web-gl-shader-sidebar.tsx
'use client'

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function WebGLShaderSidebar() {
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
       
        // Very subtle distortion for light lines
        float d = length(p) * distortion * 0.3;
       
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        // Very light green color scheme - almost white with green tint
        float r = 0.008 / abs(p.y + sin((rx + time * 0.3) * xScale) * yScale);
        float g = 0.015 / abs(p.y + sin((gx + time * 0.4) * xScale) * yScale);
        float b = 0.005 / abs(p.y + sin((bx + time * 0.35) * xScale) * yScale);
       
        // Very low intensity for subtle effect
        float intensity = 0.3 + 0.1 * sin(time * 0.2);
        
        // Light green tint with very low opacity
        vec3 color = vec3(r * 0.1, g * 0.3, b * 0.05) * intensity;
        
        // Soft fade at edges
        float edgeFade = 1.0 - smoothstep(0.5, 1.0, length(p));
        color *= edgeFade * 0.4; // Very subtle overall
       
        gl_FragColor = vec4(color, 0.08); // Very low opacity
      }
    `

    const initScene = () => {
      refs.scene = new THREE.Scene()
      refs.renderer = new THREE.WebGLRenderer({ 
        canvas,
        alpha: true,
        antialias: true 
      })
      refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      refs.renderer.setClearColor(new THREE.Color(0x000000), 0)

      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

      refs.uniforms = {
        resolution: { value: [320, window.innerHeight] }, // Sidebar width
        time: { value: 0.0 },
        xScale: { value: 0.8 }, // Slower, wider waves
        yScale: { value: 0.3 }, // Lower amplitude
        distortion: { value: 0.05 }, // Minimal distortion
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
      if (refs.uniforms) refs.uniforms.time.value += 0.005 // Very slow animation
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera)
      }
      refs.animationId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms) return
      const width = 320 // Fixed sidebar width
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
      className="fixed top-0 left-0 w-80 h-full block pointer-events-none opacity-20" // Very subtle opacity
    />
  )
}