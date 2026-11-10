"use client";

import { useEffect, useRef } from "react";

type Vec3 = readonly [number, number, number];

// Strict Chiang Mai Red Songthaew design tokens (no generic purple/blue AI gradients).
const COLORS = {
  red: hexToVec3("#b3121c"),
  redDeep: hexToVec3("#8e0e16"),
  redNight: hexToVec3("#5e0a10"),
  gold: hexToVec3("#d9ab00"),
} as const;

function hexToVec3(hex: string): Vec3 {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ];
}

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// Painted metallic red Songthaew enamel wave shader with fine film grain (GLSL ES 1.00).
const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_red;
uniform vec3 u_redDeep;
uniform vec3 u_redNight;
uniform vec3 u_gold;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float waveField(vec2 uv, float t) {
  vec2 p = uv * vec2(1.4, 1.15);
  float w1 = sin(p.x * 2.1 + t * 0.75 + cos(p.y * 1.8 - t * 0.45));
  float w2 = cos(p.y * 2.6 - t * 0.55 + sin(p.x * 1.7 + t * 0.35));
  float w3 = sin((p.x + p.y) * 1.9 - t * 0.4);
  return (w1 * 0.45 + w2 * 0.35 + w3 * 0.2) * 0.5 + 0.5;
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(u_resolution, vec2(1.0));
  float t = u_time;

  // Domain-warped painted-metal wave curvature with clearer ridge/valley depth
  vec2 warp = vec2(
    waveField(uv + vec2(0.0, 0.25), t),
    waveField(uv + vec2(0.45, 0.0), t * 0.85)
  );
  float field = waveField(uv + (warp - 0.5) * 0.56, t);
  float ridge = smoothstep(0.28, 0.82, field);
  float contour = smoothstep(0.035, 0.0, abs(fract(field * 4.0) - 0.5) - 0.44);

  // Base night-red valleys -> deep red -> lit body-red crests
  vec3 col = mix(u_redNight, u_redDeep, smoothstep(0.08, 0.48, field));
  col = mix(col, u_red, ridge);
  col = mix(col, u_redNight, contour * 0.26);

  // Restrained plate-gold metallic rim reflection along upper-right enamel curve
  float sheen = smoothstep(0.42, 0.96, uv.x * 0.72 + uv.y * 0.28) * smoothstep(0.52, 0.92, field);
  col = mix(col, u_gold, sheen * 0.16);

  // Tactile painted-enamel film grain
  float grain = (hash12(gl_FragCoord.xy + fract(t) * 17.0) - 0.5) * 0.07;
  col = clamp(col + grain, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * GPU-accelerated painted Songthaew enamel shader for the Landing Hero only.
 * Respects `prefers-reduced-motion` (`speed = 0`) and pauses offscreen via `IntersectionObserver`.
 * Falls back cleanly to the parent's CSS `.songthaew-enamel` surface when WebGL is unavailable.
 */
export function SongthaewShader({ className = "", speed = 0.25 }: { className?: string; speed?: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "a_pos");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uRed = gl.getUniformLocation(program, "u_red");
    const uRedDeep = gl.getUniformLocation(program, "u_redDeep");
    const uRedNight = gl.getUniformLocation(program, "u_redNight");
    const uGold = gl.getUniformLocation(program, "u_gold");

    gl.useProgram(program);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(uRed, COLORS.red);
    gl.uniform3fv(uRedDeep, COLORS.redDeep);
    gl.uniform3fv(uRedNight, COLORS.redNight);
    gl.uniform3fv(uGold, COLORS.gold);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let isVisible = true;
    let tabVisible = document.visibilityState !== "hidden";
    let contextLost = false;
    let elapsedSec = 0;
    let lastTs = 0;
    let rafId = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      if (contextLost) return;
      gl.useProgram(program);
      gl.uniform1f(uTime, elapsedSec);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const shouldAnimate = () => !reducedMotion && isVisible && tabVisible && !contextLost && speed > 0;

    const stopLoop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      lastTs = 0;
    };

    const tick = (ts: number) => {
      if (!shouldAnimate()) {
        rafId = 0;
        lastTs = 0;
        return;
      }
      if (lastTs > 0) {
        const dt = Math.min((ts - lastTs) / 1000, 0.1);
        elapsedSec += dt * speed;
      }
      lastTs = ts;
      draw();
      rafId = requestAnimationFrame(tick);
    };

    const syncLoop = () => {
      if (shouldAnimate()) {
        if (!rafId) rafId = requestAnimationFrame(tick);
      } else {
        stopLoop();
        draw();
      }
    };

    resize();
    draw();

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(host);

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
        syncLoop();
      },
      { threshold: 0.01 },
    );
    io.observe(host);

    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      syncLoop();
    };
    motionQuery.addEventListener("change", onMotionChange);

    const onVisibilityChange = () => {
      tabVisible = document.visibilityState !== "hidden";
      syncLoop();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      stopLoop();
    };
    const onContextRestored = () => {
      contextLost = false;
      syncLoop();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    syncLoop();

    return () => {
      stopLoop();
      ro.disconnect();
      io.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [speed]);

  return (
    <div ref={hostRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="block size-full" />
      {/* Contrast scrim anchoring --color-on-red (#ffffff) and --color-on-red-2 (#ffd9db) >= 4.5:1 */}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgb(142_14_22/0.26)_0%,rgb(179_18_28/0.06)_52%,rgb(94_10_16/0.14)_100%)]" />
    </div>
  );
}
