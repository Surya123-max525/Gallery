import { useState, useEffect, useCallback, useRef } from "react";
import { Loader } from "./components/Loader";
import { Slide } from "./components/Slide";
import { SlideInfo } from "./components/SlideInfo";

// Fallback slides if no images are added to src/assets/images
const DEFAULT_SLIDES = [
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

// Dynamically import all images in src/assets/images
const globImages = import.meta.glob<{ default: string }>("/src/assets/images/*.{png,jpg,jpeg,webp,svg}", { eager: true });

const dynamicSlides = Object.entries(globImages).map(([path, module]) => {
  // Extract filename as title (e.g. "/src/assets/images/scotland-mountains.jpg" -> "Scotland Mountains")
  const fileName = path.split("/").pop()?.split(".")[0] || "Destination";
  const formattedTitle = fileName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: formattedTitle,
    subtitle: "Explore",
    description: "Discover this beautiful destination",
    image: module.default,
  };
});

const SLIDES_DATA = dynamicSlides.length > 0 ? dynamicSlides : DEFAULT_SLIDES;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<1 | -1>(1);
  const [loadedCount, setLoadedCount] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Refs for slide info inners to allow Slide component to apply tilt properties dynamically
  const infoInnerRefs = useRef<(HTMLDivElement | null)[]>([]);

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
                  infoInnerRefs={infoInnerRefs}
                  index={idx}
                  onLoad={handleImageLoad}
                  onClick={() => setIsGalleryOpen(true)}
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
                  innerRef={(el) => {
                    infoInnerRefs.current[idx] = el;
                  }}
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

      {/* Milestones Navigation */}
      <div className="slider-milestones-container">
        <h2 className="milestones-title">Milestones</h2>
        <div className="slider-milestones">
          <div className="milestones-track">
            <div
              className="milestones-progress"
              style={{ width: `${(activeIndex / (SLIDES_DATA.length - 1)) * 100}%` }}
            />
          </div>
          {SLIDES_DATA.map((slide, idx) => {
            const isActive = idx === activeIndex;
            const isCompleted = idx < activeIndex;

            return (
              <button
                key={idx}
                className={`milestone-node ${isActive ? "active" : ""} ${
                  isCompleted ? "completed" : ""
                }`}
                onClick={() => {
                  if (!isLoaded) return;
                  setLastDirection(idx > activeIndex ? 1 : -1);
                  setActiveIndex(idx);
                }}
                style={{ left: `${(idx / (SLIDES_DATA.length - 1)) * 100}%` }}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
              >
                <div className="milestone-dot">
                  <span className="milestone-number">0{idx + 1}</span>
                </div>
                <div className="milestone-label">{slide.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Modal Popup */}
      <div
        className={`gallery-overlay ${isGalleryOpen ? "open" : ""}`}
        onClick={() => setIsGalleryOpen(false)}
      >
        <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
          <button className="gallery-close" onClick={() => setIsGalleryOpen(false)} aria-label="Close gallery">
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <h2 className="gallery-title">Voyage Collection</h2>
          <p className="gallery-subtitle">Select a destination to navigate</p>

          <div className="gallery-grid">
            {SLIDES_DATA.map((slide, idx) => (
              <div
                key={idx}
                className={`gallery-item ${idx === activeIndex ? "active" : ""}`}
                onClick={() => {
                  setLastDirection(idx > activeIndex ? 1 : -1);
                  setActiveIndex(idx);
                  setIsGalleryOpen(false);
                }}
              >
                <div className="gallery-img-wrapper">
                  <img src={slide.image} alt={slide.title} className="gallery-img" />
                </div>
                <div className="gallery-item-info">
                  <span className="gallery-item-title">{slide.title}</span>
                  <span className="gallery-item-subtitle">{slide.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
