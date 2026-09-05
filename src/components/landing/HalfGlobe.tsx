'use client';

import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface NodeMarker {
  lat: number;
  lng: number;
  pulsePhase: number;
  speed: number;
}

interface ArcConnection {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  progress: number;
  speed: number;
}

export const HalfGlobe: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let rotationY = 0;
    const tiltX = 0.32; // ~18.5 degrees gentle tilt

    // Minimalist Fibonacci sphere point distribution (lighter density for clean aesthetic)
    const dotCount = 420;
    const baseSpherePoints: Point3D[] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < dotCount; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / dotCount);
      baseSpherePoints.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta),
      });
    }

    // Minimal latitude rings (parallels)
    const latitudeAngles = [-60, -30, 0, 30, 60].map((deg) => (deg * Math.PI) / 180);
    // Minimal longitude lines (meridians) - 8 major lines
    const longitudeAngles = [0, 45, 90, 135, 180, 225, 270, 315].map(
      (deg) => (deg * Math.PI) / 180
    );

    // Subtle, slow-pulsing beacon nodes
    const nodeMarkers: NodeMarker[] = [
      { lat: 0.65, lng: -1.1, pulsePhase: 0, speed: 0.006 },
      { lat: 0.8, lng: 0.2, pulsePhase: 0.35, speed: 0.007 },
      { lat: 0.45, lng: 1.8, pulsePhase: 0.7, speed: 0.005 },
      { lat: -0.3, lng: -0.6, pulsePhase: 0.2, speed: 0.0065 },
      { lat: 0.35, lng: 2.4, pulsePhase: 0.85, speed: 0.0055 },
    ];

    // Minimal, slow connecting arcs
    const arcs: ArcConnection[] = [
      { fromLat: 0.65, fromLng: -1.1, toLat: 0.8, toLng: 0.2, progress: 0.1, speed: 0.0018 },
      { fromLat: 0.8, fromLng: 0.2, toLat: 0.45, toLng: 1.8, progress: 0.55, speed: 0.0015 },
      { fromLat: 0.45, fromLng: 1.8, toLat: 0.35, toLng: 2.4, progress: 0.8, speed: 0.0016 },
    ];

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current.targetX = (e.clientX / innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3D coordinate converter
    const latLngTo3D = (lat: number, lng: number): Point3D => ({
      x: Math.cos(lat) * Math.sin(lng),
      y: Math.sin(lat),
      z: Math.cos(lat) * Math.cos(lng),
    });

    // 3D projection helper
    const project = (
      p: Point3D,
      radius: number,
      centerX: number,
      centerY: number,
      currentTiltX: number,
      currentRotY: number
    ) => {
      // Rotate Y (spin)
      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);
      const x1 = p.x * cosY + p.z * sinY;
      const y1 = p.y;
      const z1 = -p.x * sinY + p.z * cosY;

      // Rotate X (tilt)
      const cosX = Math.cos(currentTiltX);
      const sinX = Math.sin(currentTiltX);
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      // Perspective projection
      const fov = 1100;
      const scale = fov / (fov + z2 * radius);
      const screenX = centerX + x2 * radius * scale;
      const screenY = centerY - y2 * radius * scale;

      return {
        screenX,
        screenY,
        z: z2,
        visible: z2 < 0.45,
      };
    };

    // Render loop
    const render = () => {
      if (!isVisible || !ctx || !canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width;
      const height = canvas.height;

      // Ultra-smooth, damped mouse parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.02;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.02;

      const dynamicTilt = tiltX + mouseRef.current.y * 0.04;
      // Calm, slow rotation
      rotationY += 0.00055 + mouseRef.current.x * 0.0002;

      const globeRadius = Math.max(width * 0.38, Math.min(width * 0.5, height * 0.82));
      const centerX = width / 2;
      const centerY = height + globeRadius * 0.2;

      ctx.clearRect(0, 0, width, height);
      ctx.save();

      // 1. Soft Ambient Radial Glow behind the horizon
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY - globeRadius * 0.6,
        globeRadius * 0.2,
        centerX,
        centerY - globeRadius * 0.6,
        globeRadius * 1.1
      );
      glowGrad.addColorStop(0, 'rgba(226, 232, 240, 0.4)');
      glowGrad.addColorStop(0.4, 'rgba(241, 245, 249, 0.2)');
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY - globeRadius * 0.6, globeRadius * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // 2. Graticule Lines: Latitude Circles (Thin & subtle)
      ctx.lineWidth = 0.75 * dpr;
      latitudeAngles.forEach((lat) => {
        const segSteps = 64;
        ctx.beginPath();
        let first = true;
        for (let j = 0; j <= segSteps; j++) {
          const lng = (j / segSteps) * Math.PI * 2;
          const p3 = latLngTo3D(lat, lng);
          const proj = project(p3, globeRadius, centerX, centerY, dynamicTilt, rotationY);

          if (proj.z < 0.1) {
            if (first) {
              ctx.moveTo(proj.screenX, proj.screenY);
              first = false;
            } else {
              ctx.lineTo(proj.screenX, proj.screenY);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.22)'; // slate-300 faint
        ctx.stroke();
      });

      // 3. Graticule Lines: Longitude Meridians
      longitudeAngles.forEach((lng) => {
        const segSteps = 48;
        ctx.beginPath();
        let first = true;
        for (let j = 0; j <= segSteps; j++) {
          const lat = -Math.PI / 2 + (j / segSteps) * Math.PI;
          const p3 = latLngTo3D(lat, lng);
          const proj = project(p3, globeRadius, centerX, centerY, dynamicTilt, rotationY);

          if (proj.z < 0.1) {
            if (first) {
              ctx.moveTo(proj.screenX, proj.screenY);
              first = false;
            } else {
              ctx.lineTo(proj.screenX, proj.screenY);
            }
          } else {
            first = true;
          }
        }
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.2)'; // slate-300 faint
        ctx.stroke();
      });

      // 4. Dot Grid on Sphere (Clean, refined micro-dots)
      for (let i = 0; i < baseSpherePoints.length; i++) {
        const p = baseSpherePoints[i];
        const proj = project(p, globeRadius, centerX, centerY, dynamicTilt, rotationY);

        if (proj.visible) {
          const facing = Math.max(0, -proj.z);
          const alpha = 0.08 + facing * 0.42;
          const dotRadius = (0.85 + facing * 0.9) * dpr;

          ctx.fillStyle = `rgba(100, 116, 139, ${alpha.toFixed(3)})`; // slate-500
          ctx.beginPath();
          ctx.arc(proj.screenX, proj.screenY, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Minimalist Curved Connection Arcs
      arcs.forEach((arc) => {
        arc.progress = (arc.progress + arc.speed) % 1;

        const pStart = latLngTo3D(arc.fromLat, arc.fromLng);
        const pEnd = latLngTo3D(arc.toLat, arc.toLng);

        const arcSteps = 24;
        const curvePoints: { x: number; y: number; z: number }[] = [];

        for (let step = 0; step <= arcSteps; step++) {
          const t = step / arcSteps;
          const x = pStart.x * (1 - t) + pEnd.x * t;
          const y = pStart.y * (1 - t) + pEnd.y * t;
          const z = pStart.z * (1 - t) + pEnd.z * t;
          const len = Math.sqrt(x * x + y * y + z * z) || 1;
          const altitude = 1 + Math.sin(t * Math.PI) * 0.12;

          curvePoints.push({
            x: (x / len) * altitude,
            y: (y / len) * altitude,
            z: (z / len) * altitude,
          });
        }

        // Faint Arc Path
        ctx.beginPath();
        let arcVisible = false;
        curvePoints.forEach((pt) => {
          const proj = project(pt, globeRadius, centerX, centerY, dynamicTilt, rotationY);
          if (proj.z < 0.15) {
            if (!arcVisible) {
              ctx.moveTo(proj.screenX, proj.screenY);
              arcVisible = true;
            } else {
              ctx.lineTo(proj.screenX, proj.screenY);
            }
          }
        });

        if (arcVisible) {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)'; // slate-400 subtle
          ctx.lineWidth = 0.9 * dpr;
          ctx.setLineDash([3 * dpr, 4 * dpr]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Calm light bead traveling along the arc
        const pulseIdx = Math.floor(arc.progress * arcSteps);
        const pulsePt = curvePoints[pulseIdx];
        if (pulsePt) {
          const proj = project(pulsePt, globeRadius, centerX, centerY, dynamicTilt, rotationY);
          if (proj.z < 0.15) {
            ctx.beginPath();
            ctx.arc(proj.screenX, proj.screenY, 2 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(51, 65, 85, 0.6)'; // slate-700
            ctx.fill();
          }
        }
      });

      // 6. Minimal Pulse Nodes (Subtle, calm radar rings)
      nodeMarkers.forEach((node) => {
        node.pulsePhase = (node.pulsePhase + node.speed) % 1;
        const p3 = latLngTo3D(node.lat, node.lng);
        const proj = project(p3, globeRadius, centerX, centerY, dynamicTilt, rotationY);

        if (proj.z < 0.05) {
          const facing = Math.max(0, -proj.z);
          const baseAlpha = facing * 0.7;

          // Gentle Ripple Wave
          const rippleRadius = (2 + node.pulsePhase * 12) * dpr;
          const rippleAlpha = Math.max(0, (1 - node.pulsePhase) * baseAlpha * 0.4);

          ctx.beginPath();
          ctx.arc(proj.screenX, proj.screenY, rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(100, 116, 139, ${rippleAlpha.toFixed(3)})`;
          ctx.lineWidth = 0.8 * dpr;
          ctx.stroke();

          // Small Pin Center
          ctx.beginPath();
          ctx.arc(proj.screenX, proj.screenY, 2 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(30, 41, 59, ${baseAlpha.toFixed(3)})`; // slate-800
          ctx.fill();
        }
      });

      // 7. Refined Horizon Atmospheric Rim
      const horizonGrad = ctx.createLinearGradient(
        centerX - globeRadius * 0.9,
        centerY - globeRadius,
        centerX + globeRadius * 0.9,
        centerY - globeRadius
      );
      horizonGrad.addColorStop(0, 'rgba(203, 213, 225, 0)');
      horizonGrad.addColorStop(0.25, 'rgba(148, 163, 184, 0.28)');
      horizonGrad.addColorStop(0.5, 'rgba(100, 116, 139, 0.5)');
      horizonGrad.addColorStop(0.75, 'rgba(148, 163, 184, 0.28)');
      horizonGrad.addColorStop(1, 'rgba(203, 213, 225, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, Math.PI, 2 * Math.PI, false);
      ctx.strokeStyle = horizonGrad;
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Canvas for Minimalist Animated Half Globe */}
      <canvas
        ref={canvasRef}
        className="w-full max-w-[1300px] h-[380px] sm:h-[460px] md:h-[520px] lg:h-[580px] object-contain opacity-80 transition-opacity duration-1000"
        style={{
          maskImage:
            'linear-gradient(to top, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.7) 80%, transparent 100%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 20%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 80%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </div>
  );
};
