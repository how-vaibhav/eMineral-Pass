"use client";

import { useEffect, useMemo, useState } from "react";

interface EncryptedTextProps {
  text: string;
  className?: string;
  revealDelayMs?: number;
  charset?: string;
  flipDelayMs?: number;
  encryptedClassName?: string;
  revealedClassName?: string;
}

function getSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getScrambledCharacter(charset: string, seed: number, tick: number) {
  const nextIndex = (seed + tick) % charset.length;
  return charset.charAt(nextIndex);
}

export function EncryptedText({
  text,
  className = "",
  revealDelayMs = 50,
  charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?",
  flipDelayMs = 50,
  encryptedClassName = "",
  revealedClassName = "",
}: EncryptedTextProps) {
  const [revealCount, setRevealCount] = useState(0);
  const [tick, setTick] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const characters = useMemo(
    () =>
      text.split("").map((character, index) => {
        if (index < revealCount || character === " ") {
          return { character, revealed: true };
        }

        const seed = getSeed(`${text}:${index}`);
        const scrambledCharacter = getScrambledCharacter(
          charset,
          seed,
          tick + index * 13,
        );

        return { character: scrambledCharacter, revealed: false };
      }),
    [charset, revealCount, text, tick],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateMode = () => setIsCompact(mediaQuery.matches);

    updateMode();
    mediaQuery.addEventListener("change", updateMode);

    const revealInterval = window.setInterval(() => {
      setRevealCount((current) => Math.min(current + 1, text.length));
    }, revealDelayMs);

    const flipInterval = window.setInterval(() => {
      setTick((current) => current + 1);
    }, flipDelayMs);

    return () => {
      window.clearInterval(revealInterval);
      window.clearInterval(flipInterval);
      mediaQuery.removeEventListener("change", updateMode);
    };
  }, [text, revealDelayMs, flipDelayMs]);

  if (isCompact) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className} aria-label={text} role="text">
      {characters.map((item, index) => (
        <span
          key={`${text}-${index}`}
          className={item.revealed ? revealedClassName : encryptedClassName}
        >
          {item.character}
        </span>
      ))}
    </span>
  );
}
