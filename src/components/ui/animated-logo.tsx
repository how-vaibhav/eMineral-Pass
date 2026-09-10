"use client";

import React, { useEffect, useRef } from "react";
import { animate, svg, stagger } from "animejs";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "500"], // Extremely elegant light weight
});

export function AnimatedLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  const playAnimation = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    if (typeof animate === "function") {
      // 1. Draw the 3D Geometric Mineral Crystal Icon
      // Here we actively use the animejs v4 svg.createDrawable API on the paths!
      if (svg && svg.createDrawable) {
        try {
          animate(svg.createDrawable('.logo-icon-line'), {
            draw: ['0 0', '0 1'],
            ease: 'inOutQuad',
            duration: 1500,
            delay: stagger(200)
          });
          
          // Gently fade in an inner fill for the crystal
          animate('.logo-icon-line', {
            fillOpacity: [0, 0.15],
            ease: 'inOutQuad',
            duration: 1500,
            delay: 1000
          });
        } catch(e) {
          console.warn("Could not draw icon", e);
        }
      }

      // 2. Draw the Text sequentially
      // Text is manually animated via strokeDashoffset for maximum browser compatibility
      animate('.logo-char', {
        strokeDashoffset: [150, 0],
        fillOpacity: [0, 1],
        ease: 'inOutQuad',
        duration: 1200,
        delay: stagger(50, { start: 400 }), // Start drawing text shortly after icon starts
      });

      // Release lock so it can be replayed on hover
      setTimeout(() => {
        isAnimating.current = false;
      }, 2500);
    }
  };

  useEffect(() => {
    // Initial draw on mount
    playAnimation();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="flex items-center cursor-pointer group"
      onMouseEnter={playAnimation}
    >
      <svg
        width="280"
        height="40"
        viewBox="0 0 280 40"
        className="overflow-visible drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="proGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" /> {/* sky-500 */}
            <stop offset="100%" stopColor="#8b5cf6" /> {/* violet-500 */}
          </linearGradient>
          
          {/* Subtle neon glow filter for a laser-etched effect */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- GEOMETRIC MINERAL CRYSTAL ICON --- */}
        <g 
          stroke="url(#proGrad)" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="url(#proGrad)"
          fillOpacity="0"
          filter="url(#neonGlow)"
          transform="translate(4, 2)"
        >
          {/* Outer Hexagon Outline */}
          <path
            className="logo-icon-line"
            d="M 18 4 L 6 11 L 6 25 L 18 32 L 30 25 L 30 11 Z"
          />
          {/* Inner 3D Lines forming a crystalline cube */}
          <path
            className="logo-icon-line"
            d="M 18 4 L 18 18 L 6 25 M 18 18 L 30 25"
          />
        </g>

        {/* --- STAGGERED TEXT --- */}
        <text
          x="48"
          y="26"
          className={cn(montserrat.className, "text-[18px] tracking-[0.2em] font-light")}
          fill="url(#proGrad)"
          stroke="url(#proGrad)"
          strokeWidth="0.5"
          filter="url(#neonGlow)"
        >
          {"E-MINERAL PASS".split("").map((char, index) => (
            <tspan
              key={index}
              className="logo-char"
              strokeDasharray="150"
              strokeDashoffset="150"
              fillOpacity="0"
            >
              {char === " " ? "\u00A0" : char}
            </tspan>
          ))}
        </text>
      </svg>
    </div>
  );
}
