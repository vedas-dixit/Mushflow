"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import styles from "./Loader.module.css";

const Loader = () => {
  const { isLoading } = useAppSelector((state) => state.loader);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [frames, setFrames] = useState<HTMLImageElement[]>([]);

  useEffect(() => {
    // Preload images
    const imageFrames: HTMLImageElement[] = [];
    for (let i = 1; i <= 5; i++) {
      const img = new Image();
      img.src = `/${i}.svg`; // Preload each image
      imageFrames.push(img);
    }
    setFrames(imageFrames);
  }, []);

  useEffect(() => {
    if (!isLoading || frames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev >= frames.length - 1 ? 0 : prev + 1));
    }, 150);

    return () => clearInterval(interval);
  }, [isLoading, frames]);

  if (!isLoading || frames.length === 0) return null;

  return (
    <div className={styles.loaderContainer}>
      <img
        src={frames[currentFrame].src} // Use preloaded images
        alt="Loading"
        className={styles.loaderImage}
      />
    </div>
  );
};

export default Loader;
