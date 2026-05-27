"use client";

import { useEffect, useRef, useState } from "react";
import { notify } from "@/lib/utils/notify";

interface DocxViewerProps {
  url: string;
  className?: string;
}

/**
 * Client-side DOCX viewer using docx-preview library.
 * This fetches the document via the authenticated endpoint (with HTTP-only cookies)
 * and renders it directly in the browser - no external service needed.
 */
export default function DocxViewer({ url, className = "" }: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDocument = async () => {
      if (!containerRef.current) return;

      try {
        setLoading(true);
        setError(null);

        const isAbsolute = /^https?:\/\//i.test(url);
        const isCrossOrigin =
          typeof window !== "undefined" &&
          isAbsolute &&
          (() => {
            try {
              return new URL(url).origin !== window.location.origin;
            } catch {
              return false;
            }
          })();

        const response = await fetch(url, {
          method: "GET",
          credentials: isCrossOrigin ? "omit" : "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.status}`);
        }

        const blob = await response.blob();

        if (cancelled) return;

        const docxPreview = await import("docx-preview");

        if (cancelled) return;

        containerRef.current.innerHTML = "";

        await docxPreview.renderAsync(blob, containerRef.current, undefined, {
          className: "docx-wrapper",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          experimental: false,
          trimXmlDeclaration: true,
          useBase64URL: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
        });

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.error("DocxViewer error:", err);
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "មិនអាចបើកឯកសារបានទេ។";
          setError(message);
          notify.error(message);
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className={`relative flex min-h-0 flex-col ${className}`}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <div className="text-sm text-gray-600">កំពុងផ្ទុកឯកសារ...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white px-4">
          <div className="text-center text-red-600">
            <div className="mb-2 font-semibold">មិនអាចបើកឯកសារបានទេ</div>
            <div className="text-sm wrap-break-word">{error}</div>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="docx-container min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain bg-white px-3 py-4 [-webkit-overflow-scrolling:touch] sm:px-6 sm:py-6"
      />

      <style jsx global>{`
        .docx-container {
          max-width: 100%;
        }
        .docx-wrapper {
          background: white;
          padding: 0.5rem;
          max-width: 100%;
        }
        .docx-wrapper > section.docx {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
          padding: 1rem;
          background: white;
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        @media (min-width: 640px) {
          .docx-wrapper {
            padding: 1rem;
          }
          .docx-wrapper > section.docx {
            padding: 2rem;
          }
        }
        .docx-wrapper img {
          max-width: 100%;
          height: auto;
        }
        .docx-wrapper table {
          border-collapse: collapse;
          width: 100%;
          display: block;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .docx-wrapper table td,
        .docx-wrapper table th {
          border: 1px solid #ddd;
          padding: 6px;
        }
        @media (min-width: 640px) {
          .docx-wrapper table td,
          .docx-wrapper table th {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
}
