'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export type SignaturePadHandle = {
  getDataUrl: () => string | null;
  clear: () => void;
};

type Point = { x: number; y: number };

/**
 * Minimal canvas signature capture — no external dependency for something
 * this small. Backing pixel buffer is sized to match the canvas's actual
 * rendered CSS size (scaled by devicePixelRatio) on mount, which is the
 * standard fix for canvas strokes otherwise landing at the wrong
 * position/scale when the element's CSS size differs from its default
 * 300x150 pixel buffer.
 */
export const SignaturePad = forwardRef<SignaturePadHandle, { onChange?: (hasSignature: boolean) => void }>(
  function SignaturePad({ onChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hasDrawn = useRef(false);
    const drawing = useRef(false);
    const lastPoint = useRef<Point | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.getContext('2d')?.scale(dpr, dpr);
    }, []);

    function getPos(e: React.PointerEvent<HTMLCanvasElement>): Point {
      const rect = e.currentTarget.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
      e.currentTarget.setPointerCapture(e.pointerId);
      drawing.current = true;
      lastPoint.current = getPos(e);
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
      if (!drawing.current) return;
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const point = getPos(e);
      if (lastPoint.current) {
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
      lastPoint.current = point;
      if (!hasDrawn.current) {
        hasDrawn.current = true;
        onChange?.(true);
      }
    }

    function handlePointerUp() {
      drawing.current = false;
      lastPoint.current = null;
    }

    useImperativeHandle(ref, () => ({
      getDataUrl: () => (hasDrawn.current && canvasRef.current ? canvasRef.current.toDataURL('image/png') : null),
      clear: () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawn.current = false;
        onChange?.(false);
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        className="w-full h-40 rounded-xl border-2 border-gray-200 bg-white touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    );
  }
);
