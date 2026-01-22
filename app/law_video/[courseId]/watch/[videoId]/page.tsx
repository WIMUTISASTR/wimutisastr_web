"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/compounents/PageContainer";
import ProtectedRoute from "@/compounents/ProtectedRoute";
import Button from "@/compounents/Button";
import { fetchVideoPlaybackUrl, fetchVideos, type VideoCategory, type VideoPlaybackResponse, type VideoRow } from "@/lib/api/client";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";
import { useMembership } from "@/lib/hooks/useMembership";

const FALLBACK_THUMB = "/asset/document_background.png";

type TabKey = "overview" | "notes" | "qa" | "reviews";

const STORAGE = {
  lastByCourse: "wimutisastr:lastVideoByCourse:v1",
  lastCourseId: "wimutisastr:lastCourseId:v1",
} as const;

function formatShortDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

// Icon components
const PlayIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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

const ChevronRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronLeftIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function WatchVideoPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const videoId = params.videoId as string;

  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playback, setPlayback] = useState<VideoPlaybackResponse | null>(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const { status: membershipStatus, isLoading: membershipLoading } = useMembership();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});

  // Calculate course progress
  const courseProgress = useMemo(() => {
    if (videos.length === 0) return 0;
    const watchedCount = videos.filter((v) => videoProgress[v.id] && videoProgress[v.id] > 0.9).length;
    return Math.round((watchedCount / videos.length) * 100);
  }, [videos, videoProgress]);

  const handleVideoProgress = useCallback((videoId: string, progress: number) => {
    setVideoProgress((prev) => ({ ...prev, [videoId]: progress }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchVideos(courseId);
        if (!cancelled) {
          setCategories(data.categories);
          setVideos(data.videos);
        }
      } catch (e: unknown) {
        console.error(e);
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load video.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const course = useMemo(() => categories.find((c) => c.id === courseId) ?? null, [categories, courseId]);
  const currentIndex = useMemo(() => videos.findIndex((v) => v.id === videoId), [videos, videoId]);
  const current = currentIndex >= 0 ? videos[currentIndex] : null;

  const persistLastVideo = useCallback(
    (vId: string) => {
      try {
        const raw = localStorage.getItem(STORAGE.lastByCourse);
        const base: Record<string, unknown> =
          raw && raw.trim().length > 0 ? (JSON.parse(raw) as Record<string, unknown>) : {};
        base[courseId] = vId;
        localStorage.setItem(STORAGE.lastByCourse, JSON.stringify(base));
        localStorage.setItem(STORAGE.lastCourseId, courseId);
      } catch {
        // ignore
      }
    },
    [courseId]
  );

  useEffect(() => {
    let cancelled = false;

    const loadPlayback = async () => {
      setPlayback(null);
      setPlaybackError(null);

      if (!current?.id) return;
      if (membershipLoading) return;
      if (membershipStatus !== "approved") return;

      try {
        setPlaybackLoading(true);
        persistLastVideo(current.id);
        const data = await fetchVideoPlaybackUrl(current.id);
        if (!cancelled) setPlayback(data);
      } catch (e: unknown) {
        console.error(e);
        if (!cancelled) setPlaybackError(e instanceof Error ? e.message : "Failed to load video playback URL.");
      } finally {
        if (!cancelled) setPlaybackLoading(false);
      }
    };

    loadPlayback();
    return () => {
      cancelled = true;
    };
  }, [current?.id, membershipLoading, membershipStatus, persistLastVideo]);

  const src = playback?.kind === "r2_proxy" ? playback.url : "";
  const thumb = normalizeNextImageSrc(current?.thumbnail_url, FALLBACK_THUMB);

  const prev = currentIndex > 0 ? videos[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;

  const handleGo = useCallback(
    (vId: string) => {
      persistLastVideo(vId);
      router.push(`/law_video/${courseId}/watch/${vId}`);
    },
    [courseId, persistLastVideo, router]
  );

  return (
    <ProtectedRoute>
      <PageContainer>
        <section className="py-4 sm:py-6 min-h-screen">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
            {/* Enhanced Top Navigation */}
            <div className="mb-6 animate-in">
              <div className="flex items-center justify-between mb-4">
                <Link
                  href={`/law_video/${courseId}`}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--brown)] transition-colors group"
                >
                  <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Course</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Toggle sidebar"
                >
                  <BookOpenIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
                    {current?.title ?? "Watch Video"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <BookOpenIcon className="w-4 h-4" />
                      {course?.name ?? "Course"}
                    </span>
                    <span>•</span>
                    <span>Lesson {currentIndex >= 0 ? currentIndex + 1 : "—"} of {videos.length}</span>
                    {current?.presented_by && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-4 h-4" />
                          {current.presented_by}
                        </span>
                      </>
                    )}
                    {current?.uploaded_at && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {formatShortDate(current.uploaded_at)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => prev && handleGo(prev.id)}
                    variant="outline"
                    disabled={!prev}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => next && handleGo(next.id)}
                    variant="primary"
                    disabled={!next}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center text-gray-600 py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--brown)] border-t-transparent mb-4"></div>
                <p className="text-lg">Loading course content...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 py-20">
                <div className="text-xl font-semibold mb-2">Error loading content</div>
                <p>{error}</p>
              </div>
            ) : !current ? (
              <div className="text-center text-gray-600 py-20">
                <div className="text-xl font-semibold mb-2">Video not found</div>
                <p>The video you're looking for doesn't exist.</p>
              </div>
            ) : membershipLoading ? (
              <div className="text-center text-gray-600 py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--brown)] border-t-transparent mb-4"></div>
                <p>Checking membership status...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                {/* Main Content Area */}
                <div className="space-y-6">
                  {/* Enhanced Video Player */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-scale-in">
                    <div className="relative w-full aspect-video bg-black">
                      {playbackLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90">
                          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mb-4"></div>
                          <p className="text-lg font-medium">Loading video player...</p>
                        </div>
                      ) : playbackError ? (
                        <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
                          <div className="max-w-md">
                            <div className="text-2xl font-bold mb-3">Failed to load video</div>
                            <div className="text-sm text-white/80 mb-6">{playbackError}</div>
                            <Button onClick={() => window.location.reload()} variant="primary">
                              Retry
                            </Button>
                          </div>
                        </div>
                      ) : membershipStatus !== "approved" ? (
                        <div className="absolute inset-0">
                          <Image
                            src={thumb}
                            alt={current.title ?? "Video"}
                            fill
                            className="object-cover opacity-60"
                            sizes="100vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                          <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
                            <div className="max-w-lg animate-slide-up-fade">
                              <div className="text-3xl font-bold mb-4">Membership Required</div>
                              <div className="text-base text-white/90 mb-8 leading-relaxed">
                                Unlock full access to all video courses, legal documents, and premium content. Join our community of legal professionals and students.
                              </div>
                              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={() => router.push("/pricing_page")} variant="primary" size="md">
                                  Upgrade Membership
                                </Button>
                                <Button onClick={() => router.push("/law_video")} variant="outline" size="md" className="bg-white/10 backdrop-blur text-white border-white/20 hover:bg-white/20">
                                  Browse Courses
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : playback?.kind === "r2_proxy" && src ? (
                        // Tokenized same-origin URL; works with <video> without custom headers.
                        <video
                          className="absolute inset-0 w-full h-full"
                          controls
                          playsInline
                          preload="metadata"
                          poster={thumb}
                          controlsList="nodownload noremoteplayback"
                          onContextMenu={(e) => e.preventDefault()}
                          onTimeUpdate={(e) => {
                            const video = e.currentTarget;
                            if (video.duration) {
                              const progress = video.currentTime / video.duration;
                              handleVideoProgress(current.id, progress);
                            }
                          }}
                        >
                          <source src={src} />
                        </video>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white">
                          <div>
                            <div className="text-lg font-semibold mb-2">Unsupported video source</div>
                            <div className="text-sm text-white/80">
                              This video doesn’t have a playable R2 source configured in Supabase.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Video Info Bar */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <div className="w-2 h-2 rounded-full bg-[var(--brown)]"></div>
                            <span className="font-medium">Lesson {currentIndex >= 0 ? currentIndex + 1 : "—"}</span>
                          </div>
                          <div className="text-gray-500">
                            {videos.length} {videos.length === 1 ? "video" : "videos"} in course
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {courseProgress > 0 && (
                            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[var(--brown)] rounded-full transition-all duration-500"
                                  style={{ width: `${courseProgress}%` }}
                                ></div>
                              </div>
                              <span className="font-medium">{courseProgress}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Tabs Section */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-scale-in delay-200">
                    <div className="px-6 pt-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                        {[
                          { key: "overview" as const, label: "Overview", icon: BookOpenIcon },
                          { key: "notes" as const, label: "Notes", icon: BookOpenIcon },
                          { key: "qa" as const, label: "Q&A", icon: BookOpenIcon },
                          { key: "reviews" as const, label: "Reviews", icon: BookOpenIcon },
                        ].map((t) => {
                          const Icon = t.icon;
                          return (
                            <button
                              key={t.key}
                              type="button"
                              onClick={() => setActiveTab(t.key)}
                              className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 flex items-center gap-2 ${
                                activeTab === t.key
                                  ? "border-[var(--brown)] text-[var(--brown)]"
                                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="animate-fadeInUp">
                        {activeTab === "overview" ? (
                          <div className="space-y-6">
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900 mb-3">{course?.name ?? "Course Overview"}</h2>
                              {course?.description ? (
                                <p className="text-gray-700 leading-relaxed">{course.description}</p>
                              ) : (
                                <p className="text-gray-600 italic">No description available for this course.</p>
                              )}
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[var(--brown)]/10 flex items-center justify-center">
                                  <PlayIcon className="w-6 h-6 text-[var(--brown)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 mb-1">Current Lesson</div>
                                  <div className="text-lg font-bold text-gray-900 mb-2">{current.title ?? "Untitled"}</div>
                                  {current.presented_by && (
                                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                                      <UserIcon className="w-4 h-4 text-[var(--brown)]" />
                                      <span className="font-medium">Presented by:</span>
                                      <span className="text-[var(--brown)] font-semibold">{current.presented_by}</span>
                                    </div>
                                  )}
                                  {current.description ? (
                                    <div className="text-sm text-gray-600 leading-relaxed">{current.description}</div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                              <BookOpenIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="text-lg font-semibold text-gray-900 mb-2">
                              {activeTab === "notes" && "Notes"}
                              {activeTab === "qa" && "Questions & Answers"}
                              {activeTab === "reviews" && "Reviews"}
                            </div>
                            <p className="text-gray-600">This section is coming soon. Check back later for updates.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar - Course Content */}
                <aside
                  className={`${
                    sidebarOpen ? "block" : "hidden"
                  } lg:block space-y-6 animate-slide-up-fade delay-300`}
                >
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden sticky top-6">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[var(--brown)]/5 to-white">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">Course Content</h3>
                        {courseProgress > 0 && (
                          <span className="text-xs font-semibold text-[var(--brown)] bg-[var(--brown)]/10 px-3 py-1 rounded-full">
                            {courseProgress}% Complete
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{videos.length} {videos.length === 1 ? "lesson" : "lessons"}</p>
                    </div>

                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                      <div className="p-4 space-y-1">
                        {videos.map((video, idx) => {
                          const isActive = video.id === videoId;
                          const isWatched = videoProgress[video.id] && videoProgress[video.id] > 0.9;
                          const progress = videoProgress[video.id] || 0;

                          return (
                            <button
                              key={video.id}
                              onClick={() => handleGo(video.id)}
                              className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                                isActive
                                  ? "bg-[var(--brown)]/10 border-2 border-[var(--brown)] shadow-md"
                                  : "hover:bg-gray-50 border-2 border-transparent hover:border-gray-200"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {isWatched ? (
                                    <div className="w-6 h-6 rounded-full bg-[var(--brown)] flex items-center justify-center">
                                      <CheckIcon className="w-4 h-4 text-white" />
                                    </div>
                                  ) : (
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                                        isActive
                                          ? "bg-[var(--brown)] text-white"
                                          : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                                      }`}
                                    >
                                      {idx + 1}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div
                                    className={`text-sm font-semibold mb-1 line-clamp-2 ${
                                      isActive ? "text-[var(--brown)]" : "text-gray-900"
                                    }`}
                                  >
                                    {video.title ?? `Lesson ${idx + 1}`}
                                  </div>
                                  {progress > 0 && progress < 0.9 && (
                                    <div className="mt-2">
                                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-[var(--brown)] rounded-full transition-all duration-300"
                                          style={{ width: `${progress * 100}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {isActive && (
                                  <PlayIcon className="w-5 h-5 text-[var(--brown)] flex-shrink-0 mt-0.5" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </section>
      </PageContainer>
    </ProtectedRoute>
  );
}

