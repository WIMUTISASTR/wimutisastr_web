"use client";

import { useEffect, useRef, useState } from "react";

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

        // Fetch the document with credentials (cookies will be sent automatically)
        const response = await fetch(url, {
          method: "GET",
          credentials: "include", // Important: send HTTP-only cookies
        });

        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.status}`);
        }

        const blob = await response.blob();

        if (cancelled) return;

        // Dynamic import of docx-preview to avoid SSR issues
        const docxPreview = await import("docx-preview");

        if (cancelled) return;

        // Clear container and render the document
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
          setError(err instanceof Error ? err.message : "Failed to load document");
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
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
            <div className="text-sm text-gray-600">Loading document...</div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-center text-red-600">
            <div className="font-semibold mb-2">Failed to load document</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Document will be rendered here */}
      <div
        ref={containerRef}
        className="docx-container bg-white min-h-[60vh]"
        style={{
          // Style the docx-preview output
          padding: "1rem",
        }}
      />

      {/* Custom styles for docx-preview */}
      <style jsx global>{`
        .docx-wrapper {
          background: white;
          padding: 1rem;
        }
        .docx-wrapper > section.docx {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
          padding: 2rem;
          background: white;
        }
        .docx-wrapper img {
          max-width: 100%;
          height: auto;
        }
        .docx-wrapper table {
          border-collapse: collapse;
          width: 100%;
        }
        .docx-wrapper table td,
        .docx-wrapper table th {
          border: 1px solid #ddd;
          padding: 8px;
        }
      `}</style>
    </div>
  );
}
