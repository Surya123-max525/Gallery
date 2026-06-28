import React from "react";

interface SlideInfoProps {
  title: string;
  subtitle: string;
  description: string;
  isActive: boolean;
  isNext: boolean;
  isPrevious: boolean;
  innerRef: React.RefObject<HTMLDivElement | null>;
}

export const SlideInfo: React.FC<SlideInfoProps> = ({
  title,
  subtitle,
  description,
  isActive,
  isNext,
  isPrevious,
  innerRef,
}) => {
  const attribs: Record<string, string | boolean> = {};
  if (isActive) attribs["data-current"] = true;
  else if (isNext) attribs["data-next"] = true;
  else if (isPrevious) attribs["data-previous"] = true;

  // Split title and subtitle into characters for premium staggered reveal
  const renderStaggeredCharacters = (text: string, baseDelay: number) => {
    return text.split("").map((char, charIdx) => {
      const isSpace = char === " ";
      return (
        <span
          key={charIdx}
          className="char-span"
          style={{
            transitionDelay: `${baseDelay + charIdx * 25}ms`,
            marginRight: isSpace ? "0.25em" : "0",
            whiteSpace: isSpace ? "pre" : "normal",
          }}
        >
          {char}
        </span>
      );
    });
  };

  // Split description into words for staggered fade-in
  const renderStaggeredWords = (text: string, baseDelay: number) => {
    return text.split(" ").map((word, wordIdx) => {
      return (
        <span
          key={wordIdx}
          className="char-span"
          style={{
            transitionDelay: `${baseDelay + wordIdx * 45}ms`,
            marginRight: "0.25em",
          }}
        >
          {word}
        </span>
      );
    });
  };

  return (
    <div className="slide-info" {...attribs}>
      <div ref={innerRef} className="slide-info__inner">
        <div className="slide-info--text__wrapper">
          <h2 data-title className="slide-info--text">
            {renderStaggeredCharacters(title, 200)}
          </h2>
          <h3 data-subtitle className="slide-info--text">
            {renderStaggeredCharacters(subtitle, 450)}
          </h3>
          <p data-description className="slide-info--text">
            {renderStaggeredWords(description, 700)}
          </p>
        </div>
      </div>
    </div>
  );
};
