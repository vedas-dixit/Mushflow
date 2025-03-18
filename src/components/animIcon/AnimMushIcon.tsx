"use client";

import React, { useEffect, useRef, useState } from "react";


const AnimatedMushIcon = () => {

  const mushhovered = useRef<HTMLDivElement | null>(null);
  const [mushsrc, setMushsrc] = useState("/mush1.svg");
  useEffect(() => {
    const mush = mushhovered.current;
    if (mush) {
        console.log("mush element is available:", mush);
        
        const handleMouseEnter = () => {
            setMushsrc("/mush2.svg");
        };
        const handleMouseLeave = () => {
            setMushsrc("/mush1.svg");
        };
        
        mush.addEventListener('mouseenter', handleMouseEnter);
        mush.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            mush.removeEventListener('mouseenter', handleMouseEnter);
            mush.removeEventListener('mouseleave', handleMouseLeave);
        };
    }
}, []);

  return (
    <div className="flex items-center" ref={mushhovered}>
    <img
        src={mushsrc}
        alt="Mush Logo"
        className="w-10 h-10"
    />

</div>
  );
};

export default AnimatedMushIcon;
