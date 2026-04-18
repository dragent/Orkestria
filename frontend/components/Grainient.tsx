"use client";

import { useEffect, useRef } from "react";

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0,0)),f-vec2(0,0)),dot(-1.0+2.0*hash(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0,1)),f-vec2(0,1)),dot(-1.0+2.0*hash(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);return 0.5+0.5*n;}

void main(){
  float t=iTime*uTimeSpeed;
  vec2 uv=gl_FragCoord.xy/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float wt=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*uWarpFrequency+wt)/amplitude;
  tuv.y+=sin(tuv.x*(uWarpFrequency*1.5)+wt)/(amplitude*0.5);

  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 br=Rot(radians(uBlendAngle));
  float bx=(tuv*br).x;
  float e0=-0.3-b-s, e1=0.2-b+s, v0=0.5-b+s, v1=-0.3-b-s;
  vec3 l1=mix(uColor3,uColor2,S(e0,e1,bx));
  vec3 l2=mix(uColor2,uColor1,S(e0,e1,bx));
  vec3 col=mix(l1,l2,S(v0,v1,tuv.y));

  vec2 guv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5) guv+=vec2(iTime*0.05);
  float grain=fract(sin(dot(guv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);
  fragColor=vec4(col,1.0);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return [1, 1, 1];
  return [parseInt(r[1], 16) / 255, parseInt(r[2], 16) / 255, parseInt(r[3], 16) / 255];
}

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  return prog;
}

interface GrainientProps {
  timeSpeed?: number;
  colorBalance?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  className?: string;
}

export default function Grainient({
  timeSpeed = 0.25,
  colorBalance = 0.0,
  warpStrength = 1.0,
  warpFrequency = 5.0,
  warpSpeed = 2.0,
  warpAmplitude = 50.0,
  blendAngle = 0.0,
  blendSoftness = 0.05,
  rotationAmount = 500.0,
  noiseScale = 2.0,
  grainAmount = 0.1,
  grainScale = 2.0,
  grainAnimated = false,
  contrast = 1.5,
  gamma = 1.0,
  saturation = 1.0,
  centerX = 0.0,
  centerY = 0.0,
  zoom = 0.9,
  color1 = "#a855f7",
  color2 = "#7c3aed",
  color3 = "#1e1b4b",
  className = "",
}: GrainientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
    container.appendChild(canvas);

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      container.removeChild(canvas);
      return;
    }

    const prog = createProgram(gl);
    gl.useProgram(prog);

    // Full-screen triangle (no UV needed)
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // Uniform locations
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const locs = {
      iTime: u("iTime"), iResolution: u("iResolution"),
      uTimeSpeed: u("uTimeSpeed"), uColorBalance: u("uColorBalance"),
      uWarpStrength: u("uWarpStrength"), uWarpFrequency: u("uWarpFrequency"),
      uWarpSpeed: u("uWarpSpeed"), uWarpAmplitude: u("uWarpAmplitude"),
      uBlendAngle: u("uBlendAngle"), uBlendSoftness: u("uBlendSoftness"),
      uRotationAmount: u("uRotationAmount"), uNoiseScale: u("uNoiseScale"),
      uGrainAmount: u("uGrainAmount"), uGrainScale: u("uGrainScale"),
      uGrainAnimated: u("uGrainAnimated"), uContrast: u("uContrast"),
      uGamma: u("uGamma"), uSaturation: u("uSaturation"),
      uCenterOffset: u("uCenterOffset"), uZoom: u("uZoom"),
      uColor1: u("uColor1"), uColor2: u("uColor2"), uColor3: u("uColor3"),
    };

    const setUniforms = () => {
      gl.uniform1f(locs.uTimeSpeed, timeSpeed);
      gl.uniform1f(locs.uColorBalance, colorBalance);
      gl.uniform1f(locs.uWarpStrength, warpStrength);
      gl.uniform1f(locs.uWarpFrequency, warpFrequency);
      gl.uniform1f(locs.uWarpSpeed, warpSpeed);
      gl.uniform1f(locs.uWarpAmplitude, warpAmplitude);
      gl.uniform1f(locs.uBlendAngle, blendAngle);
      gl.uniform1f(locs.uBlendSoftness, blendSoftness);
      gl.uniform1f(locs.uRotationAmount, rotationAmount);
      gl.uniform1f(locs.uNoiseScale, noiseScale);
      gl.uniform1f(locs.uGrainAmount, grainAmount);
      gl.uniform1f(locs.uGrainScale, grainScale);
      gl.uniform1f(locs.uGrainAnimated, grainAnimated ? 1.0 : 0.0);
      gl.uniform1f(locs.uContrast, contrast);
      gl.uniform1f(locs.uGamma, gamma);
      gl.uniform1f(locs.uSaturation, saturation);
      gl.uniform2f(locs.uCenterOffset, centerX, centerY);
      gl.uniform1f(locs.uZoom, zoom);
      gl.uniform3fv(locs.uColor1, hexToRgb(color1));
      gl.uniform3fv(locs.uColor2, hexToRgb(color2));
      gl.uniform3fv(locs.uColor3, hexToRgb(color3));
    };

    setUniforms();

    const resize = () => {
      const { offsetWidth: w, offsetHeight: h } = container;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(locs.iResolution, canvas.width, canvas.height);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      gl.uniform1f(locs.iTime, (now - t0) * 0.001);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      try { container.removeChild(canvas); } catch { /* already removed */ }
    };
  }, [
    timeSpeed, colorBalance, warpStrength, warpFrequency, warpSpeed,
    warpAmplitude, blendAngle, blendSoftness, rotationAmount, noiseScale,
    grainAmount, grainScale, grainAnimated, contrast, gamma, saturation,
    centerX, centerY, zoom, color1, color2, color3,
  ]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full ${className}`}
    />
  );
}
