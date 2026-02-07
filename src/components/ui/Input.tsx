"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const focusRelativeField = (current: HTMLElement, direction: "up" | "down") => {
  const form = current.closest("form");
  if (!form) return false;

  const fields = Array.from(
    form.querySelectorAll<HTMLElement>("input, select, textarea"),
  ).filter((field) => {
    if (field.hasAttribute("disabled")) return false;
    if (field.getAttribute("type") === "hidden") return false;
    if (field.getAttribute("aria-hidden") === "true") return false;
    if (field.tabIndex === -1) return false;
    return true;
  });

  const index = fields.indexOf(current);
  if (index === -1) return false;

  const nextIndex = direction === "down" ? index + 1 : index - 1;
  const nextField = fields[nextIndex];
  if (!nextField) return false;

  nextField.focus();
  return true;
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export function Input({ error, label, className, ...props }: InputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (
      (event.key === "ArrowDown" || event.key === "ArrowUp") &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey
    ) {
      const moved = focusRelativeField(
        event.currentTarget,
        event.key === "ArrowDown" ? "down" : "up",
      );
      if (moved) {
        event.preventDefault();
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-foreground">
          {label}
        </label>
      )}
      <input
        className={cn(
          "flex h-11 w-full rounded-md border border-input/70 bg-background/80 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-200",
          error && "border-destructive focus:ring-destructive",
          className,
        )}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export function TextArea({ error, label, className, ...props }: TextAreaProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (
      (event.key === "ArrowDown" || event.key === "ArrowUp") &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey
    ) {
      const moved = focusRelativeField(
        event.currentTarget,
        event.key === "ArrowDown" ? "down" : "up",
      );
      if (moved) {
        event.preventDefault();
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-foreground">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-md border border-input/70 bg-background/80 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-200 resize-none",
          error && "border-destructive focus:ring-destructive",
          className,
        )}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: Array<{ label: string; value: string }>;
}

export function Select({
  error,
  label,
  options,
  className,
  ...props
}: SelectProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLSelectElement>) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (
      (event.key === "ArrowDown" || event.key === "ArrowUp") &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey
    ) {
      const moved = focusRelativeField(
        event.currentTarget,
        event.key === "ArrowDown" ? "down" : "up",
      );
      if (moved) {
        event.preventDefault();
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-foreground">
          {label}
        </label>
      )}
      <select
        className={cn(
          "flex h-11 w-full rounded-md border border-input/70 bg-background/80 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors duration-200",
          error && "border-destructive focus:ring-destructive",
          className,
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}
