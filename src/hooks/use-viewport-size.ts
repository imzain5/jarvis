"use client";

import { useEffect, useState } from "react";

export function useViewportSize() {
  const [size, setSize] = useState({
    width: 1280,
    height: 720,
  });

  useEffect(() => {
    function updateSize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}
