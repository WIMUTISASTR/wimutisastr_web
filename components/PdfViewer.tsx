"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import LoadingState from "@/components/LoadingState";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.2;

interface PdfViewerProps {
  url: string;
  className?: string;
}

export default function PdfViewer({ url, className = "" }: PdfViewerProps) {
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

  // Load document
  useEffect(() => {
    let cancelled = false;
    setIsDocLoading(true);
    setLoadError(null);
    setPdf(null);
    setCurrentPage(1);

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

  // Render page whenever pdf, currentPage, or scale changes
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    let cancelled = false;

    const renderPage = async () => {
      // Cancel any in-progress render
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch {}
        renderTaskRef.current = null;
      }

      setIsPageRendering(true);

      try {
        const page = await pdf.getPage(currentPage);
        if (cancelled) return;

        // Fit to container width on first load
        let resolvedScale = scale;
        if (containerRef.current) {
          const containerWidth = containerRef.current.clientWidth - 32; // subtract padding
          const unscaledViewport = page.getViewport({ scale: 1 });
          const fitScale = containerWidth / unscaledViewport.width;
          // Only auto-fit on initial render (scale === 1.3 default and fits better)
          resolvedScale = scale;
          // If scale pushes beyond container, keep it but let the container scroll
          void fitScale; // used for reference only
        }

        const viewport = page.getViewport({ scale: resolvedScale });
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;

        // Retina / HiDPI support
        const dpr = window.devicePixelRatio || 1;
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
        // RenderingCancelledException is expected when switching pages fast
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

  const goTo = useCallback((page: number) => {
    const clamped = Math.max(1, Math.min(page, numPages));
    setCurrentPage(clamped);
    setPageInputValue(String(clamped));
  }, [numPages]);

  const zoomIn = () => setScale((s) => Math.min(parseFloat((s + SCALE_STEP).toFixed(1)), MAX_SCALE));
  const zoomOut = () => setScale((s) => Math.max(parseFloat((s - SCALE_STEP).toFixed(1)), MIN_SCALE));

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const n = parseInt(pageInputValue, 10);
      if (!isNaN(n)) goTo(n);
    }
  };

  if (isDocLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[60vh] ${className}`}>
        <LoadingState label="កំពុងផ្ទុក PDF..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`flex items-center justify-center min-h-[60vh] text-center px-6 ${className}`}>
        <div>
          <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-red-600 font-medium">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-slate-100 ${className}`}>
      {/* Top toolbar — zoom only */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-slate-800 text-white px-4 py-2 shadow-md">
        {/* Rendering indicator */}
        <div className="flex items-center gap-1.5 text-xs text-white/60 min-w-0">
          {isPageRendering && (
            <>
              <svg className="animate-spin w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              កំពុងបង្ហាញ...
            </>
          )}
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>

          <span className="text-xs text-white/70 w-10 text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className="flex-1 overflow-auto flex justify-center py-6 px-4">
        <div className="shadow-2xl bg-white">
          <canvas ref={canvasRef} className="block" />
        </div>
      </div>

      {/* Bottom bar — page navigation */}
      <div className="sticky bottom-0 z-20 flex items-center justify-center gap-3 bg-slate-800 text-white px-4 py-2 shadow-md">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-1 text-sm">
          <input
            type="text"
            value={pageInputValue}
            onChange={(e) => setPageInputValue(e.target.value)}
            onKeyDown={handlePageInputKeyDown}
            onBlur={() => {
              const n = parseInt(pageInputValue, 10);
              if (!isNaN(n)) goTo(n); else setPageInputValue(String(currentPage));
            }}
            className="w-10 text-center bg-white/10 border border-white/20 rounded px-1 py-0.5 text-white text-sm focus:outline-none focus:bg-white/20"
          />
          <span className="text-white/60 text-sm">/ {numPages}</span>
        </div>

        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= numPages}
          className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
