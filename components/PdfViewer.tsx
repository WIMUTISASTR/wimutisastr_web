"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import LoadingState from "@/components/LoadingState";
import { getReadingPage, saveReadingPage } from "@/lib/utils/readingProgress";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.2;

interface PdfViewerProps {
  url: string;
  bookId?: string;
  className?: string;
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-lg p-2 transition-colors hover:bg-white/10 active:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30 sm:min-h-0 sm:min-w-0 sm:p-1.5"
    >
      {children}
    </button>
  );
}

export default function PdfViewer({ url, bookId, className = "" }: PdfViewerProps) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isDocLoading, setIsDocLoading] = useState(true);
  const [isPageRendering, setIsPageRendering] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [loadError, setLoadError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAutoFitRef = useRef(false);
  const hasRestoredPageRef = useRef(false);

  const goTo = useCallback((page: number) => {
    const clamped = Math.max(1, Math.min(page, numPages || 1));
    setCurrentPage(clamped);
    setPageInputValue(String(clamped));
  }, [numPages]);

  const computeFitScale = useCallback(async (doc: PDFDocumentProxy, pageNum = 1) => {
    if (!containerRef.current) return null;
    const page = await doc.getPage(pageNum);
    const horizontalPadding = window.innerWidth < 640 ? 16 : 32;
    const containerWidth = Math.max(120, containerRef.current.clientWidth - horizontalPadding);
    const unscaledViewport = page.getViewport({ scale: 1 });
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, containerWidth / unscaledViewport.width));
  }, []);

  const fitToWidth = useCallback(async () => {
    if (!pdf) return;
    try {
      const fitScale = await computeFitScale(pdf, currentPage);
      if (fitScale != null) setScale(parseFloat(fitScale.toFixed(2)));
    } catch (err) {
      console.error("PDF fit-to-width error:", err);
    }
  }, [pdf, currentPage, computeFitScale]);

  useEffect(() => {
    let cancelled = false;
    setIsDocLoading(true);
    setLoadError(null);
    setPdf(null);
    setCurrentPage(1);
    setPageInputValue("1");
    hasAutoFitRef.current = false;
    hasRestoredPageRef.current = false;
    setScale(1.0);

    pdfjsLib
      .getDocument({ url, withCredentials: true })
      .promise.then((doc) => {
        if (cancelled) return;
        setPdf(doc);
        setNumPages(doc.numPages);
        setIsDocLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("PDF load error:", err);
        setLoadError("មិនអាចផ្ទុក PDF បានទេ។ សូមព្យាយាមម្ដងទៀត។");
        setIsDocLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (!pdf || hasAutoFitRef.current || !containerRef.current) return;

    let cancelled = false;

    const autoFit = async () => {
      try {
        const fitScale = await computeFitScale(pdf, 1);
        if (cancelled || fitScale == null) return;
        hasAutoFitRef.current = true;
        setScale(parseFloat(fitScale.toFixed(2)));
      } catch (err) {
        console.error("PDF auto-fit error:", err);
      }
    };

    autoFit();

    return () => {
      cancelled = true;
    };
  }, [pdf, computeFitScale]);

  useEffect(() => {
    if (!pdf || !containerRef.current) return;

    const el = containerRef.current;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const ro = new ResizeObserver(() => {
      if (!hasAutoFitRef.current) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        void fitToWidth();
      }, 150);
    });

    ro.observe(el);
    return () => {
      clearTimeout(timeoutId);
      ro.disconnect();
    };
  }, [pdf, fitToWidth]);

  useEffect(() => {
    if (!pdf || !bookId || hasRestoredPageRef.current) return;

    const saved = getReadingPage(bookId);
    hasRestoredPageRef.current = true;

    if (saved && saved <= pdf.numPages && saved !== 1) {
      setCurrentPage(saved);
      setPageInputValue(String(saved));
    }
  }, [pdf, bookId]);

  useEffect(() => {
    if (!bookId || !pdf || currentPage < 1) return;
    saveReadingPage(bookId, currentPage);
  }, [bookId, pdf, currentPage]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    let cancelled = false;

    const renderPage = async () => {
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch {}
        renderTaskRef.current = null;
      }

      setIsPageRendering(true);

      try {
        const page = await pdf.getPage(currentPage);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);

        ctx.scale(dpr, dpr);

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;

        if (!cancelled) setIsPageRendering(false);
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof Error && err.name === "RenderingCancelledException") return;
        console.error("Page render error:", err);
        setIsPageRendering(false);
      }
    };

    renderPage();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch {}
        renderTaskRef.current = null;
      }
    };
  }, [pdf, currentPage, scale]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(currentPage - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(currentPage + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, goTo]);

  const zoomIn = () => setScale((s) => Math.min(parseFloat((s + SCALE_STEP).toFixed(1)), MAX_SCALE));
  const zoomOut = () => setScale((s) => Math.max(parseFloat((s - SCALE_STEP).toFixed(1)), MIN_SCALE));

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const n = parseInt(pageInputValue, 10);
      if (!isNaN(n)) goTo(n);
    }
  };

  const toolbarSafeArea = { paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" } as const;

  if (isDocLoading) {
    return (
      <div className={`flex min-h-[50dvh] items-center justify-center ${className}`}>
        <LoadingState label="កំពុងផ្ទុក PDF..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`flex min-h-[50dvh] items-center justify-center px-4 text-center sm:px-6 ${className}`}>
        <div>
          <svg className="mx-auto mb-3 h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="font-medium text-red-600">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-0 flex-col bg-slate-100 ${className}`}>
      <div
        className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 bg-slate-800 px-2 py-2 text-white shadow-md sm:gap-3 sm:px-4"
        style={toolbarSafeArea}
      >
        <div className="flex min-w-0 items-center gap-2 text-xs text-white/60">
          {isPageRendering ? (
            <>
              <svg className="h-3 w-3 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="sr-only sm:not-sr-only sm:inline">កំពុងបង្ហាញ...</span>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-0.5 sm:gap-2">
          <ToolbarButton label="បង្រួម" onClick={zoomOut} disabled={scale <= MIN_SCALE}>
            <svg className="h-4 w-4 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </ToolbarButton>

          <span className="w-10 text-center text-xs tabular-nums text-white/70 sm:w-12">
            {Math.round(scale * 100)}%
          </span>

          <ToolbarButton label="ពង្រីក" onClick={zoomIn} disabled={scale >= MAX_SCALE}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </ToolbarButton>

          <ToolbarButton label="ប្ដូរទំហំឲ្យជាប់ទទឹង" onClick={() => void fitToWidth()}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </ToolbarButton>
        </div>
      </div>

      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain px-2 py-4 [-webkit-overflow-scrolling:touch] sm:px-4 sm:py-6"
      >
        <div className="mx-auto w-max max-w-full shadow-2xl bg-white">
          <canvas ref={canvasRef} className="block max-w-full" />
        </div>
      </div>

      <div
        className="sticky bottom-0 z-20 flex items-center justify-center gap-2 bg-slate-800 px-2 py-2 text-white shadow-[0_-2px_12px_rgba(0,0,0,0.2)] sm:gap-3 sm:px-4"
        style={toolbarSafeArea}
      >
        <ToolbarButton label="ទំព័រមុន" onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </ToolbarButton>

        <div className="flex items-center gap-1 text-sm">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pageInputValue}
            onChange={(e) => setPageInputValue(e.target.value)}
            onKeyDown={handlePageInputKeyDown}
            onBlur={() => {
              const n = parseInt(pageInputValue, 10);
              if (!isNaN(n)) goTo(n); else setPageInputValue(String(currentPage));
            }}
            aria-label="លេខទំព័រ"
            className="w-11 rounded border border-white/20 bg-white/10 px-1 py-1.5 text-center text-base text-white focus:bg-white/20 focus:outline-none sm:w-10 sm:py-0.5 sm:text-sm"
          />
          <span className="text-sm text-white/60">/ {numPages}</span>
        </div>

        <ToolbarButton label="ទំព័របន្ទាប់" onClick={() => goTo(currentPage + 1)} disabled={currentPage >= numPages}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </ToolbarButton>
      </div>
    </div>
  );
}
