"use client";

import React, { useRef, useState, useEffect } from "react";
import { Eraser } from "lucide-react";
import { Button } from "./Button";

interface SignaturePadProps {
  onSignatureChange?: (dataUrl: string | null) => void;
  onClear?: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSignatureChange,
  onClear,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Detecta si la interfaz está en modo oscuro para ajustar el color del trazo
      const isDarkMode = document.documentElement.classList.contains("dark");
      ctx.strokeStyle = isDarkMode ? "#F8FAFC" : "#0F172A";
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);

    if (ctx) {
      // Reasegura el color de trazo al empezar a dibujar según el tema actual
      const isDarkMode = document.documentElement.classList.contains("dark");
      ctx.strokeStyle = isDarkMode ? "#F8FAFC" : "#0F172A";

      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);

    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);

      // Notificamos la firma actualizada
      if (onSignatureChange) {
        onSignatureChange(canvas.toDataURL("image/png"));
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      if (onSignatureChange) onSignatureChange(null);
      if (onClear) onClear();
    }
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/60 relative overflow-hidden touch-none transition-colors">
        <canvas
          ref={canvasRef}
          width={500}
          height={180}
          className="w-full h-[180px] cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 dark:text-slate-500 text-xs font-medium">
            Firme aquí con el dedo, lápiz o mouse
          </div>
        )}
      </div>

      <div className="flex justify-start">
        <Button
          type="button"
          variant="secondary"
          onClick={clearCanvas}
          icon={<Eraser className="w-3.5 h-3.5" />}
        >
          Limpiar Firma
        </Button>
      </div>
    </div>
  );
};
