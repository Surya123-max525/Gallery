import React, { useEffect, useRef, useCallback } from "react";

interface SlideProps {
  image: string;
  alt: string;
  isActive: boolean;
  isNext: boolean;
  isPrevious: boolean;
  zIndex: number;
  infoInnerRef: React.RefObject<HTMLDivElement | null>;
  onLoad: () => void;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const Slide: React.FC<SlideProps> = ({
  image,
  alt,
  isActive,
  isNext,
  isPrevious,
  zIndex,
  infoInnerRef,
  onLoad,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const loadedRef = useRef(false);

  const handleLoad = useCallback(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      onLoad();
    }
  }, [onLoad]);

  // Check if image is already completed (cached) when mounting
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      handleLoad();
    }
  }, [handleLoad]);


  useEffect(() => {
    if (!isActive) return;

    const el = ref.current;
    if (!el) return;

    let rotX = 0;
    let rotY = 0;
    let bgPosX = 0;
    let bgPosY = 0;

    let targetRotX = 0;
    let targetRotY = 0;
    let targetBgPosX = 0;
    let targetBgPosY = 0;

    let lerpAmount = 0.06;
    let rafId: number;

    const tick = () => {
      rotX = lerp(rotX, targetRotX, lerpAmount);
      rotY = lerp(rotY, targetRotY, lerpAmount);
      bgPosX = lerp(bgPosX, targetBgPosX, lerpAmount);
      bgPosY = lerp(bgPosY, targetBgPosY, lerpAmount);

      // Set CSS variables on slide__inner
      if (innerRef.current) {
        innerRef.current.style.setProperty("--rotX", `${rotY.toFixed(2)}deg`);
        innerRef.current.style.setProperty("--rotY", `${rotX.toFixed(2)}deg`);
        innerRef.current.style.setProperty("--bgPosX", `${bgPosX.toFixed(2)}%`);
        innerRef.current.style.setProperty("--bgPosY", `${bgPosY.toFixed(2)}%`);
      }

      // Set CSS variables on slide-info__inner
      if (infoInnerRef.current) {
        infoInnerRef.current.style.setProperty("--rotX", `${rotY.toFixed(2)}deg`);
        infoInnerRef.current.style.setProperty("--rotY", `${rotX.toFixed(2)}deg`);
      }

      rafId = requestAnimationFrame(tick);
    };

    const handleMouseMove = (e: MouseEvent) => {
      lerpAmount = 0.1;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Ox and Oy matching original script.js
      const ox = (x - rect.width * 0.5) / (Math.PI * 3);
      const oy = -(y - rect.height * 0.5) / (Math.PI * 4);

      targetRotX = ox;
      targetRotY = oy;
      targetBgPosX = -ox * 0.3;
      targetBgPosY = oy * 0.3;
    };

    const handleMouseLeave = () => {
      lerpAmount = 0.06;
      targetRotX = 0;
      targetRotY = 0;
      targetBgPosX = 0;
      targetBgPosY = 0;
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [isActive, infoInnerRef]);

  // Determine slide attributes
  const attribs: Record<string, string | boolean> = {};
  if (isActive) attribs["data-current"] = true;
  else if (isNext) attribs["data-next"] = true;
  else if (isPrevious) attribs["data-previous"] = true;

  return (
    <div
      ref={ref}
      className="slide"
      style={{ zIndex }}
      {...attribs}
    >
      <div ref={innerRef} className="slide__inner">
        <div className="slide--image__wrapper">
          <img
            ref={imgRef}
            className="slide--image"
            src={image}
            alt={alt}
            onLoad={handleLoad}
          />
        </div>
      </div>
    </div>
  );
};
