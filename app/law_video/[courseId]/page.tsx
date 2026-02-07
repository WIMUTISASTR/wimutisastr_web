"use client";

import Image from "next/image";
import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchVideos, type VideoCategory, type VideoRow } from "@/lib/api/client";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";
import { useMembership } from "@/lib/hooks/useMembership";

const FALLBACK_THUMB = "/asset/document_background.png";

function shouldDisableImageOptimization(src: string) {
  return src.includes(".r2.dev/");
}

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

// Icon components
const ChevronLeftIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const PlayIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BookOpenIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function VideoCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.courseId as string;

  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status: membershipStatus } = useMembership();
  const isApproved = membershipStatus === "approved";

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchVideos(categoryId);
        if (!cancelled) {
          setCategories(data.categories);
          setVideos(data.videos);
        }
      } catch (e: unknown) {
        console.error(e);
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load videos.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const category = useMemo(() => categories.find((c) => c.id === categoryId) ?? null, [categories, categoryId]);

  return (
    <ProtectedRoute>
      <PageContainer>
        {/* Header (match Documents category header style) */}
        <section className="relative bg-slate-900 text-white py-14 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/asset/document_background.png"
              alt="Courses background"
              fill
              className="object-cover"
              priority
              sizes="100vw"
              fetchPriority="high"
            />
          </div>
          <div className="absolute inset-0 bg-slate-900/65 z-10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
            <Link
              href="/law_video"
              className="inline-flex items-center text-gray-300 hover:text-white mb-4 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Courses
            </Link>
            <h1 className="text-3xl font-semibold">{category?.name ?? "Course"}</h1>
            <p className="text-gray-300 max-w-3xl">{category?.description ?? ""}</p>
          </div>
        </section>

        {/* Course Content Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="w-[80vw] max-w-[80vw] mx-auto">
            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 animate-pulse"
                  >
                    <div className="flex gap-6">
                      <div className="w-64 h-40 bg-gray-200 rounded-xl" />
                      <div className="flex-1 space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-10 bg-gray-200 rounded w-32" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-red-900 mb-2">Error loading videos</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <BookOpenIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-xl font-semibold text-gray-900 mb-2">No videos available</p>
                <p className="text-sm text-gray-600">This course doesn&apos;t have any videos yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video, index) => {
                  const thumb = normalizeNextImageSrc(video.thumbnail_url, FALLBACK_THUMB);
                  const unoptimized = shouldDisableImageOptimization(thumb);
                  const isLocked = !isApproved && video.access_level !== "free";
                  
                  return (
                    <div
                      key={video.id}
                      className="group bg-white rounded-none overflow-hidden border-b border-black transition-all duration-300 animate-scale-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="p-6 sm:p-8">
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                          {/* Video Thumbnail */}
                          <Link
                            href={`/law_video/${categoryId}/watch/${video.id}`}
                            className="relative w-full lg:w-80 xl:w-96 aspect-video overflow-hidden block shrink-0 group/thumb"
                            onClick={(e) => {
                              if (!isLocked) return;
                              e.preventDefault();
                              router.push("/pricing_page");
                            }}
                          >
                            <Image
                              src={thumb}
                              alt={video.title ?? "Video"}
                              fill
                              className="object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                              sizes="(max-width: 1024px) 100vw, 400px"
                              unoptimized={unoptimized}
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
                            {isLocked && (
                              <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900">
                                  Members only
                                </span>
                              </div>
                            )}
                            
                            {/* Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300">
                            <div className="w-20 h-20 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl transform group-hover/thumb:scale-110 transition-transform">
                                <PlayIcon className="w-10 h-10 text-(--brown) ml-1" />
                              </div>
                            </div>
                          </Link>

                          {/* Video Info */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <Link
                                href={`/law_video/${categoryId}/watch/${video.id}`}
                                className="group/title"
                                onClick={(e) => {
                                  if (!isLocked) return;
                                  e.preventDefault();
                                  router.push("/pricing_page");
                                }}
                              >
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 group-hover/title:text-(--brown) transition-colors">
                                  {index + 1}. {video.title ?? "Untitled Lesson"}
                                </h3>
                              </Link>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                {video.presented_by && (
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-(--brown)" />
                                    <span className="font-medium">Presented by:</span>
                                    <span className="text-(--brown) font-semibold">{video.presented_by}</span>
                                  </div>
                                )}
                                {video.uploaded_at && (
                                  <div className="flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4" />
                                    <span>Uploaded {formatDate(video.uploaded_at)}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <BookOpenIcon className="w-4 h-4" />
                                  <span>Part of {category?.name ?? "Course"}</span>
                                </div>
                              </div>

                              {video.description && (
                                <p className="text-gray-700 leading-relaxed mb-6 line-clamp-3">
                                  {video.description}
                                </p>
                              )}
                            </div>

                            {/* Action Button */}
                            <div className="pt-4 border-t border-gray-100">
                              <Button
                                onClick={() => router.push(isLocked ? "/pricing_page" : `/law_video/${categoryId}/watch/${video.id}`)}
                                variant="primary"
                                className="w-full sm:w-auto"
                              >
                                <PlayIcon className="w-5 h-5" />
                                {isLocked ? "Upgrade to Access" : "Watch Now"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </PageContainer>
    </ProtectedRoute>
  );
}
