"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { partnerLogos, partners } from "@/data/partners";

export default function PartnerMarquee() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const minOffsetRef = useRef(0);
  const maxOffsetRef = useRef(0);
  const directionRef = useRef(1);
  const hoveredRef = useRef(false);
  const draggingRef = useRef(false);
  const pointerXRef = useRef(0);
  const previousTimeRef = useRef(0);
  const hoverResumeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;
    const viewport = viewportRef.current;
    if (!track || !group || !viewport) return;

    const updateBounds = () => {
      const overflow = viewport.clientWidth - group.getBoundingClientRect().width;
      minOffsetRef.current = Math.min(0, overflow);
      maxOffsetRef.current = Math.max(0, overflow);
      offsetRef.current = Math.min(maxOffsetRef.current, Math.max(minOffsetRef.current, offsetRef.current));
    };
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(group);
    resizeObserver.observe(viewport);
    updateBounds();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const animate = (time: number) => {
      if (previousTimeRef.current && !hoveredRef.current && !draggingRef.current && !reducedMotion) {
        const distance = ((time - previousTimeRef.current) * 24) / 1000;
        const nextOffset = offsetRef.current + distance * directionRef.current;
        if (nextOffset >= maxOffsetRef.current) {
          offsetRef.current = maxOffsetRef.current;
          directionRef.current = -1;
        } else if (nextOffset <= minOffsetRef.current) {
          offsetRef.current = minOffsetRef.current;
          directionRef.current = 1;
        } else {
          offsetRef.current = nextOffset;
        }
      }
      previousTimeRef.current = time;
      track.style.transform = `translateX(${offsetRef.current}px)`;
      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      if (hoverResumeTimerRef.current !== null) {
        window.clearTimeout(hoverResumeTimerRef.current);
      }
    };
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (hoverResumeTimerRef.current !== null) {
      window.clearTimeout(hoverResumeTimerRef.current);
      hoverResumeTimerRef.current = null;
    }
    draggingRef.current = true;
    pointerXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const delta = event.clientX - pointerXRef.current;
    pointerXRef.current = event.clientX;
    offsetRef.current = Math.min(
      maxOffsetRef.current,
      Math.max(minOffsetRef.current, offsetRef.current + delta),
    );
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
    }
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (hoveredRef.current) {
      hoverResumeTimerRef.current = window.setTimeout(() => {
        hoveredRef.current = false;
        hoverResumeTimerRef.current = null;
      }, 1200);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={viewportRef}
      className="partner-marquee"
      role="region"
      aria-label="Logos des partenaires. Faire glisser pour parcourir."
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse" || event.pointerType === "pen") {
          hoveredRef.current = true;
          if (hoverResumeTimerRef.current !== null) {
            window.clearTimeout(hoverResumeTimerRef.current);
          }
          hoverResumeTimerRef.current = window.setTimeout(() => {
            hoveredRef.current = false;
            hoverResumeTimerRef.current = null;
          }, 1200);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse" || event.pointerType === "pen") {
          hoveredRef.current = false;
          if (hoverResumeTimerRef.current !== null) {
            window.clearTimeout(hoverResumeTimerRef.current);
            hoverResumeTimerRef.current = null;
          }
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <div ref={trackRef} className="partner-track">
        <div ref={groupRef} className="partner-group">
          {partners.map((name) => (
            <div key={name} className="card partner">
              {partnerLogos[name] ? (
                <Image
                  src={partnerLogos[name]}
                  alt={name}
                  width={180}
                  height={90}
                  style={{ width: "100%", height: "auto", objectFit: "contain" }}
                  draggable={false}
                />
              ) : name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
