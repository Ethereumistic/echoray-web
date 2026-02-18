"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { Button } from "@echoray/ui/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

const SCROLL_IMAGES = [
  "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/scroll/1-danirusev.webp",
  "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/scroll/2-danirusev.webp",
  "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/scroll/3-danirusev.webp",
];

export function PhoneMockScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    ["-17.5deg", "17.5deg"],
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    ["17.5deg", "-17.5deg"],
  );

  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], ["-20px", "20px"]);
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], ["20px", "-20px"]);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);

  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.9) 10%, rgba(255, 255, 255, 0.75) 20%, rgba(255, 255, 255, 0) 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const scrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: -580, behavior: "smooth" });
    }
  };

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 580, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center perspective-distant overflow-visible">
      <div className="flex items-center gap-4">
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-[3rem] overflow-visible"
          style={{
            rotateX,
            rotateY,
            translateX,
            translateY,
            transformStyle: "preserve-3d",
            boxShadow:
              "rgba(0, 0, 0, 0.3) 0px 20px 40px -10px, rgba(0, 0, 0, 0.2) 0px 10px 20px -10px",
          }}
          initial={{ scale: 1, opacity: 0, z: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{
            scale: 1.05,
            z: 50,
            transition: { duration: 0.2 },
          }}
        >
          <div className="relative w-[280px] h-[580px] bg-black rounded-[3rem] p-[10px] border-[3px] border-zinc-800">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-b-[1.25rem] z-20">
              <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[85px] h-[25px] bg-black rounded-full flex items-center justify-center">
                <div className="w-[10px] h-[10px] rounded-full bg-zinc-900 ring-1 ring-zinc-700 mr-2" />
              </div>
            </div>

            <div className="absolute right-[-3px] top-[120px] w-[3px] h-[60px] bg-zinc-700 rounded-r-sm" />
            <div className="absolute right-[-3px] top-[200px] w-[3px] h-[90px] bg-zinc-700 rounded-r-sm" />
            <div className="absolute right-[-3px] top-[310px] w-[3px] h-[90px] bg-zinc-700 rounded-r-sm" />
            <div className="absolute left-[-3px] top-[160px] w-[3px] h-[30px] bg-zinc-700 rounded-l-sm" />
            <div className="absolute left-[-3px] top-[210px] w-[3px] h-[60px] bg-zinc-700 rounded-l-sm" />
            <div className="absolute left-[-3px] top-[290px] w-[3px] h-[60px] bg-zinc-700 rounded-l-sm" />

            <div
              ref={scrollRef}
              className="w-full h-full rounded-[2.5rem] overflow-y-auto bg-zinc-900"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {SCROLL_IMAGES.map((src, index) => (
                <img
                  key={index}
                  loading="lazy"
                  className="w-full h-auto block"
                  alt={`Scroll content ${index + 1}`}
                  src={src}
                />
              ))}
            </div>

            <motion.div
              className="pointer-events-none absolute inset-0 rounded-[3rem] mix-blend-overlay z-10"
              style={{
                background: glareBackground,
                opacity: 0.6,
              }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </motion.div>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={scrollUp}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={scrollDown}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 blur-2xl -z-10 pointer-events-none"
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
