import { useState, useEffect, useCallback, useRef } from "react";
import { Loader } from "./components/Loader";
import { Slide } from "./components/Slide";
import { SlideInfo } from "./components/SlideInfo";

const SLIDES_DATA = [
  {
    title: "Highlands",
    subtitle: "Scotland",
    description: "The mountains are calling",
    image: "https://devloop01.github.io/voyage-slider/images/scotland-mountains.jpg",
  },
  {
    title: "Machu Pichu",
    subtitle: "Peru",
    description: "Adventure is never far away",
    image: "https://devloop01.github.io/voyage-slider/images/machu-pichu.jpg",
  },
  {
    title: "Chamonix",
    subtitle: "France",
    description: "Let your dreams come true",
    image: "https://devloop01.github.io/voyage-slider/images/chamonix.jpg",
  },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<1 | -1>(1);
  const [loadedCount, setLoadedCount] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Refs for slide info inners to allow Slide component to apply tilt properties
  const infoInnerRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  // Callback for image loaded
  const handleImageLoad = useCallback(() => {
    setLoadedCount((prev) => Math.min(prev + 1, SLIDES_DATA.length));
  }, []);

  // Smooth loader progress interpolation
  useEffect(() => {
    let currentProgress = progressPercent;
    let rafId: number;
    const targetProgress = (loadedCount / SLIDES_DATA.length) * 100;

    if (currentProgress >= targetProgress && loadedCount < SLIDES_DATA.length) {
      return;
    }

    const tick = () => {
      currentProgress = lerp(currentProgress, targetProgress, 0.06);
      const rounded = Math.round(currentProgress);

      setProgressPercent((prev) => {
        if (prev !== rounded) {
          return rounded;
        }
        return prev;
      });

      if (rounded >= 100 && loadedCount === SLIDES_DATA.length) {
        setIsLoaded(true);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [loadedCount, progressPercent]);

  // Automatic scroll every 20 seconds
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      changeSlide(1);
    }, 20000);

    return () => clearInterval(interval);
  }, [activeIndex, isLoaded]);

  const changeSlide = (direction: 1 | -1) => {
    if (!isLoaded) return;
    setLastDirection(direction);
    setActiveIndex((current) => (current + direction + SLIDES_DATA.length) % SLIDES_DATA.length);
  };

  const getZIndex = (idx: number) => {
    const N = SLIDES_DATA.length;
    if (idx === activeIndex) return 20;
    if (idx === (activeIndex - lastDirection + N) % N) return 30; // Slide that just left
    return 10; // Rest
  };

  return (
    <>
      <h1 className="sr-only">Voyage Slider - Interactive 3D Card Slider</h1>
      <Loader progress={progressPercent} isLoaded={isLoaded} />

      <div className="slider">
        {/* Previous Button */}
        <button
          className="slider--btn slider--btn__prev"
          onClick={() => changeSlide(-1)}
          aria-label="Previous slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Slides Wrapper */}
        <div className="slides__wrapper">
          <div className="slides">
            {SLIDES_DATA.map((slide, idx) => {
              const isActive = idx === activeIndex;
              const isNext = idx === (activeIndex + 1) % SLIDES_DATA.length;
              const isPrevious = idx === (activeIndex - 1 + SLIDES_DATA.length) % SLIDES_DATA.length;

              return (
                <Slide
                  key={idx}
                  image={slide.image}
                  alt={slide.title}
                  isActive={isActive}
                  isNext={isNext}
                  isPrevious={isPrevious}
                  zIndex={getZIndex(idx)}
                  infoInnerRef={infoInnerRefs[idx]}
                  onLoad={handleImageLoad}
                />
              );
            })}
          </div>

          {/* Slide Backgrounds */}
          {SLIDES_DATA.map((slide, idx) => {
            const isActive = idx === activeIndex;
            const isNext = idx === (activeIndex + 1) % SLIDES_DATA.length;
            const isPrevious = idx === (activeIndex - 1 + SLIDES_DATA.length) % SLIDES_DATA.length;

            const bgAttribs: Record<string, string | boolean> = {};
            if (isActive) bgAttribs["data-current"] = true;
            else if (isNext) bgAttribs["data-next"] = true;
            else if (isPrevious) bgAttribs["data-previous"] = true;

            return (
              <div
                key={idx}
                className="slide__bg"
                style={{ "--bg": `url(${slide.image})` } as React.CSSProperties}
                {...bgAttribs}
              />
            );
          })}

          {/* Slides Info Text */}
          <div className="slides--infos">
            {SLIDES_DATA.map((slide, idx) => {
              const isActive = idx === activeIndex;
              const isNext = idx === (activeIndex + 1) % SLIDES_DATA.length;
              const isPrevious = idx === (activeIndex - 1 + SLIDES_DATA.length) % SLIDES_DATA.length;

              return (
                <SlideInfo
                  key={idx}
                  title={slide.title}
                  subtitle={slide.subtitle}
                  description={slide.description}
                  isActive={isActive}
                  isNext={isNext}
                  isPrevious={isPrevious}
                  innerRef={infoInnerRefs[idx]}
                />
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        <button
          className="slider--btn slider--btn__next"
          onClick={() => changeSlide(1)}
          aria-label="Next slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </>
  );
}

export default App;
