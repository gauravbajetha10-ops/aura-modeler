'use client';

import { useEffect, useRef } from 'react';

const FRAME_COUNT = 150;

export default function ScrollCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndex = useRef(1);
  const targetFrame = useRef(1);
  const requestRef = useRef<number>(0);
  const isReducedMotion = useRef(false);
  const isImagesLoaded = useRef(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion.current = mediaQuery.matches;

    // Preload images
    let loadedCount = 0;

    const preload = () => {
      // Prevent double loading in dev mode
      if (imagesRef.current.length === FRAME_COUNT) return;

      const loadedImages: HTMLImageElement[] = [];
      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new window.Image();
        const indexStr = i.toString().padStart(3, '0');
        img.src = `/frames/frame_${indexStr}.png`;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === 1) {
            // Render first frame as soon as it's loaded to avoid blank flash
            renderFrame(1, loadedImages);
          }
          if (loadedCount === FRAME_COUNT) {
            isImagesLoaded.current = true;
          }
        };
        loadedImages.push(img);
      }
      imagesRef.current = loadedImages;
    };

    preload();

    // Scroll listener
    const handleScroll = () => {
      // Calculate scroll fraction based on how far down we are
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = maxScroll > 0 ? window.scrollY / maxScroll : 0;

      const frame = Math.min(
        FRAME_COUNT,
        Math.max(1, Math.floor(scrollFraction * FRAME_COUNT) + 1)
      );

      targetFrame.current = frame;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger once to set initial target based on current scroll position
    handleScroll();

    // Animation loop
    const renderFrame = (index: number, imgList = imagesRef.current) => {
      if (!canvasRef.current || imgList.length === 0) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const currentImage = imgList[Math.floor(index) - 1];
      if (!currentImage || !currentImage.complete) return;

      // Handle resize / DPI
      const dpr = window.devicePixelRatio || 1;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Only resize if needed to prevent constant reallocation
      if (canvas.width !== windowWidth * dpr || canvas.height !== windowHeight * dpr) {
        canvas.width = windowWidth * dpr;
        canvas.height = windowHeight * dpr;
        canvas.style.width = `${windowWidth}px`;
        canvas.style.height = `${windowHeight}px`;
        ctx.scale(dpr, dpr);
      }

      // Draw image to cover canvas (object-fit: cover logic)
      const imgRatio = currentImage.width / currentImage.height;
      const canvasRatio = windowWidth / windowHeight;
      let drawWidth, drawHeight, x, y;

      if (canvasRatio > imgRatio) {
        drawWidth = windowWidth;
        drawHeight = windowWidth / imgRatio;
        x = 0;
        y = (windowHeight - drawHeight) / 2;
      } else {
        drawWidth = windowHeight * imgRatio;
        drawHeight = windowHeight;
        x = (windowWidth - drawWidth) / 2;
        y = 0;
      }

      // We use a dark color as background fill just in case
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, windowWidth, windowHeight);
      ctx.drawImage(currentImage, x, y, drawWidth, drawHeight);
    };

    const loop = () => {
      // Always loop, smoothly approach target
      if (isReducedMotion.current) {
        frameIndex.current = targetFrame.current;
      } else {
        // Lerp logic
        const diff = targetFrame.current - frameIndex.current;
        if (Math.abs(diff) > 0.05) {
          frameIndex.current += diff * 0.08;
        } else {
          frameIndex.current = targetFrame.current;
        }
      }

      // Only render if we have images
      if (imagesRef.current.length > 0) {
        renderFrame(frameIndex.current);
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    // Start loop
    requestRef.current = requestAnimationFrame(loop);

    // Handle resize gracefully
    const handleResize = () => {
      if (imagesRef.current.length > 0) renderFrame(frameIndex.current);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-screen -z-10 bg-black pointer-events-none"
    />
  );
}
