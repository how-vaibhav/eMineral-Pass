"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
  filter?: boolean;
}

export function TextGenerateEffect({
  words,
  className,
  duration = 1.5,
  filter = true,
}: TextGenerateEffectProps) {
  const [isCompact, setIsCompact] = useState(false);
  const segments = useMemo(() => words.split(/(\s+)/), [words]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateMode = () => setIsCompact(mediaQuery.matches);

    updateMode();
    mediaQuery.addEventListener("change", updateMode);

    return () => mediaQuery.removeEventListener("change", updateMode);
  }, []);

  if (isCompact) {
    return (
      <span
        className={cn(
          "inline-block whitespace-normal break-words",
          filter && "drop-shadow-sm",
          className,
        )}
      >
        {words}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-block whitespace-normal break-words",
        filter && "drop-shadow-sm",
        className,
      )}
    >
      {segments.map((segment, index) => {
        const isWhitespace = /^\s+$/.test(segment);

        if (isWhitespace) {
          return <span key={`${segment}-${index}`}>{segment}</span>;
        }

        return (
          <motion.span
            key={`${segment}-${index}`}
            className={cn(
              "inline-block will-change-[opacity,transform,filter]",
            )}
            initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: duration * 0.4,
              delay: index * 0.07,
              ease: "easeOut",
            }}
            style={{ filter: filter ? undefined : "none" }}
          >
            {segment}
          </motion.span>
        );
      })}
    </span>
  );
}
