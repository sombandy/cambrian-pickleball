"use client";

import { ChevronDown, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { EXPORT_FORMATS, exportSchedule, type ScheduleSheet } from "./schedule-export";

// Export button with a format dropdown. `getSheet` is read on click, so the
// export always matches the view on screen.
export function ExportMenu({ getSheet }: { getSheet: () => ScheduleSheet }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="soft-button flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Export
        <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Export format"
          className="absolute right-0 z-20 mt-1 grid min-w-full overflow-hidden rounded-xl border border-outline/80 bg-white shadow-lg"
        >
          {EXPORT_FORMATS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                void exportSchedule(getSheet(), id);
              }}
              className="px-3 py-2 text-left text-sm font-semibold text-ink hover:bg-court-soft/60"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
