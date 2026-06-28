import React from "react";

interface LoaderProps {
  progress: number;
  isLoaded: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ progress, isLoaded }) => {
  return (
    <div
      className="loader"
      style={{
        opacity: isLoaded ? 0 : 1,
        pointerEvents: isLoaded ? "none" : "auto",
      }}
    >
      <span className="loader__text">{progress}%</span>
    </div>
  );
};
