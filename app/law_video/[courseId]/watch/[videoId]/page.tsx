"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";
import {
  fetchVideoPlaybackUrl,
  fetchVideos,
  type VideoCategory,
  type VideoPlaybackResponse,
  type VideoRow,
} from "@/lib/api/client";
import { normalizeNextImageSrc } from "@/lib/utils/normalize-next-image-src";
import { useMembership } from "@/lib/hooks/useMembership";
import { canWatchVideo } from "@/lib/utils/videoAccess";
import { notify } from "@/lib/utils/notify";

const FALLBACK_THUMB = "/asset/document_background.png";

function shouldDisableImageOptimization(src: string) {
  return src.includes(".r2.dev/") || /^https?:\/\//i.test(src);
}

const STORAGE = {
  lastByCourse: "wimutisastr:lastVideoByCourse:v1",
  lastCourseId: "wimutisastr:lastCourseId:v1",
} as const;

function formatShortDate(v: string | null | undefined) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("km-KH", { year: "numeric", month: "short", day: "2-digit" });
}

const PlayIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const ChevronRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronLeftIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const UserIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalendarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LockIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const [descExpanded, setDescExpanded] = useState(false);

  const courseProgress = useMemo(() => {
    if (videos.length === 0) return 0;
    const watchedCount = videos.filter((v) => videoProgress[v.id] && videoProgress[v.id] > 0.9).length;
    return Math.round((watchedCount / videos.length) * 100);
  }, [videos, videoProgress]);

  const handleVideoProgress = useCallback((vId: string, progress: number) => {
    setVideoProgress((prev) => ({ ...prev, [vId]: progress }));
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
        if (!cancelled) {
          const message = e instanceof Error ? e.message : "ផ្ទុកវីដេអូមិនជោគជ័យ។";
          setError(message);
          notify.error(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [courseId]);

  const course = useMemo(() => categories.find((c) => c.id === courseId) ?? null, [categories, courseId]);
  const currentIndex = useMemo(() => videos.findIndex((v) => v.id === videoId), [videos, videoId]);
  const current = currentIndex >= 0 ? videos[currentIndex] : null;
  const isApproved = membershipStatus === "approved";
  const canPlayCurrent = canWatchVideo(current, isApproved);
  const prev = currentIndex > 0 ? videos[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;

  const persistLastVideo = useCallback(
    (vId: string) => {
      try {
        const raw = localStorage.getItem(STORAGE.lastByCourse);
        const base: Record<string, unknown> =
          raw && raw.trim().length > 0 ? (JSON.parse(raw) as Record<string, unknown>) : {};
        base[courseId] = vId;
        localStorage.setItem(STORAGE.lastByCourse, JSON.stringify(base));
        localStorage.setItem(STORAGE.lastCourseId, courseId);
      } catch { /* ignore */ }
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
      if (!canWatchVideo(current, isApproved)) return;
      try {
        setPlaybackLoading(true);
        persistLastVideo(current.id);
        const data = await fetchVideoPlaybackUrl(current.id);
        if (!cancelled) setPlayback(data);
      } catch (e: unknown) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : "ផ្ទុកតំណភ្ជាប់ចាក់វីដេអូមិនជោគជ័យ។";
          setPlaybackError(message);
          notify.error(message);
        }
      } finally {
        if (!cancelled) setPlaybackLoading(false);
      }
    };
    loadPlayback();
    return () => { cancelled = true; };
  }, [current, isApproved, membershipLoading, persistLastVideo]);

  const src = playback?.kind === "r2_proxy" ? playback.url : "";
  const thumb = normalizeNextImageSrc(current?.thumbnail_url, FALLBACK_THUMB, { bucket: "video" });
  const thumbUnoptimized = shouldDisableImageOptimization(thumb);

  const handleGo = useCallback(
    (vId: string) => {
      const target = videos.find((v) => v.id === vId);
      if (!canWatchVideo(target, isApproved)) {
        router.push("/pricing_page");
        return;
      }
      persistLastVideo(vId);
      router.push(`/law_video/${courseId}/watch/${vId}`);
    },
    [courseId, isApproved, persistLastVideo, router, videos]
  );

  return (
      <PageContainer>
        <div className="text-gray-900">
          {/* ── Breadcrumb ── */}
          <div className="flex items-center gap-1.5 px-4 sm:px-6 py-3 text-sm text-gray-500 border-b border-gray-200">
            <Link href="/law_video" className="hover:text-gray-900 transition-colors">
              វគ្គសិក្សា
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-700 truncate max-w-[200px]">{course?.name ?? "..."}</span>
          </div>

          {/* ── Main layout ── */}
          <div className="flex flex-col lg:flex-row lg:items-start">

            {/* ══ LEFT: Player + Info ══ */}
            <div className="flex-1 min-w-0 lg:pl-6 xl:pl-10">

              {/* Player area */}
              <div className="relative w-full aspect-video bg-black">
                {isLoading || membershipLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                    <p className="text-sm text-gray-300">
                      {membershipLoading ? "កំពុងពិនិត្យសមាជិកភាព..." : "កំពុងផ្ទុក..."}
                    </p>
                  </div>
                ) : error ? (
                  <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
                    <div>
                      <p className="text-lg font-semibold mb-2">ផ្ទុកមាតិកាមិនជោគជ័យ</p>
                      <p className="text-sm text-gray-300">{error}</p>
                    </div>
                  </div>
                ) : !current ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    រកមិនឃើញវីដេអូ
                  </div>
                ) : !canPlayCurrent ? (
                  /* ── Paywall ── */
                  <div className="absolute inset-0">
                    <Image
                      src={thumb}
                      alt={current.title ?? ""}
                      fill
                      className="object-cover opacity-40"
                      sizes="100vw"
                      unoptimized={thumbUnoptimized}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                      <div className="max-w-md">
                        <div className="flex justify-center mb-4 text-gray-400">
                          <LockIcon />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">ត្រូវការសមាជិកភាព</h2>
                        <p className="text-gray-300 text-sm leading-relaxed mb-6">
                          មេរៀននេះសម្រាប់សមាជិកប៉ុណ្ណោះ។ សូមជ្រើសមេរៀនឥតគិតថ្លៃក្នុងបញ្ជី ឬដំឡើងសមាជិកភាពដើម្បីមើលពេញលេញ។
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button onClick={() => router.push("/pricing_page")} variant="primary">
                            ដំឡើងសមាជិកភាព
                          </Button>
                          <Button
                            onClick={() => router.push("/law_video")}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            រកមើលវគ្គផ្សេង
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : playbackLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                    <p className="text-sm text-gray-300">កំពុងផ្ទុកវីដេអូ...</p>
                  </div>
                ) : playbackError ? (
                  <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
                    <div>
                      <p className="text-lg font-semibold mb-2">ផ្ទុកវីដេអូមិនជោគជ័យ</p>
                      <p className="text-sm text-gray-300 mb-4">{playbackError}</p>
                      <Button onClick={() => window.location.reload()} variant="primary">
                        ព្យាយាមម្តងទៀត
                      </Button>
                    </div>
                  </div>
                ) : playback?.kind === "r2_proxy" && src ? (
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
                        handleVideoProgress(current.id, video.currentTime / video.duration);
                      }
                    }}
                  >
                    <source src={src} />
                  </video>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-center p-6 text-gray-300">
                    <p>ប្រភពវីដេអូមិនត្រូវបានគាំទ្រ</p>
                  </div>
                )}
              </div>

              {/* Video info */}
              <div className="px-4 sm:px-6 py-5 border-b border-gray-200 lg:border-b-0">
                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                  {current?.title ?? "—"}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-sm text-gray-500">
                  {course?.name && (
                    <Link
                      href="/law_video"
                      className="font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {course.name}
                    </Link>
                  )}
                  {currentIndex >= 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>មេរៀន {currentIndex + 1} / {videos.length}</span>
                    </>
                  )}
                  {current?.presented_by && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1">
                        <UserIcon />
                        {current.presented_by}
                      </span>
                    </>
                  )}
                  {formatShortDate(current?.uploaded_at) && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon />
                        {formatShortDate(current?.uploaded_at)}
                      </span>
                    </>
                  )}
                </div>

                {/* Prev / Next + progress */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <button
                    disabled={!prev || !canWatchVideo(prev, isApproved)}
                    onClick={() => prev && handleGo(prev.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 disabled:opacity-30 hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeftIcon /> មុន
                  </button>
                  <button
                    disabled={!next || !canWatchVideo(next, isApproved)}
                    onClick={() => next && handleGo(next.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 disabled:opacity-30 hover:bg-gray-200 transition-colors"
                  >
                    បន្ទាប់ <ChevronRightIcon />
                  </button>

                  {courseProgress > 0 && (
                    <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${courseProgress}%` }}
                        />
                      </div>
                      <span className="text-xs">{courseProgress}% បញ្ចប់</span>
                    </div>
                  )}
                </div>

                {/* Description (expandable) */}
                {current?.description && (
                  <div className="mt-4">
                    <button
                      onClick={() => setDescExpanded((v) => !v)}
                      className="w-full text-left"
                    >
                      <div className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 leading-relaxed ${!descExpanded ? "line-clamp-2" : ""}`}>
                        {current.description}
                      </div>
                      <span className="text-xs text-gray-400 mt-1.5 inline-block hover:text-gray-600 transition-colors">
                        {descExpanded ? "បង្រួម ▲" : "មើលបន្ថែម ▼"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ══ RIGHT: Playlist ══ */}
            <aside className="w-full lg:w-[380px] xl:w-[420px] shrink-0 border-t border-gray-200 lg:border-t-0 lg:border-l lg:border-gray-200 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] flex flex-col bg-gray-50">

              {/* Playlist header */}
              <div className="shrink-0 px-4 py-4 border-b border-gray-200">
                <div className="font-bold text-gray-900 text-base leading-snug">
                  {course?.name ?? "វគ្គសិក្សា"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {videos.length} មេរៀន
                  {courseProgress > 0 && (
                    <span className="ml-2 text-emerald-600">{courseProgress}% បញ្ចប់</span>
                  )}
                </div>
                {courseProgress > 0 && (
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${courseProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Scrollable video list */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                    កំពុងផ្ទុក...
                  </div>
                ) : (
                  <div className="py-1">
                    {videos.map((v, idx) => {
                      const isActive = v.id === videoId;
                      const isWatched = (videoProgress[v.id] ?? 0) > 0.9;
                      const progress = videoProgress[v.id] ?? 0;
                      const vLocked = !canWatchVideo(v, isApproved);
                      const vThumb = normalizeNextImageSrc(v.thumbnail_url, FALLBACK_THUMB, { bucket: "video" });
                      const vThumbUnoptimized = shouldDisableImageOptimization(vThumb);

                      return (
                        <button
                          key={v.id}
                          onClick={() => handleGo(v.id)}
                          className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors border-l-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-300 ${
                            isActive
                              ? "bg-emerald-50 border-emerald-500"
                              : vLocked
                                ? "opacity-70 hover:bg-gray-50 border-transparent"
                                : "hover:bg-gray-100 border-transparent"
                          }`}
                        >
                          {/* Number / check */}
                          <div className="shrink-0 w-5 flex justify-center mt-2">
                            {isWatched ? (
                              <CheckIcon className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <span className={`text-xs font-mono ${isActive ? "text-emerald-600" : "text-gray-400"}`}>
                                {idx + 1}
                              </span>
                            )}
                          </div>

                          {/* Thumbnail */}
                          <div className="relative shrink-0 w-[108px] aspect-video rounded overflow-hidden bg-gray-200">
                            <Image
                              src={vThumb}
                              alt={v.title ?? ""}
                              fill
                              className="object-cover"
                              sizes="108px"
                              unoptimized={vThumbUnoptimized}
                            />
                            {isActive && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <PlayIcon className="w-5 h-5 text-white drop-shadow" />
                              </div>
                            )}
                            {progress > 0 && progress < 0.9 && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{ width: `${progress * 100}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Title + presenter */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className={`text-sm font-medium line-clamp-2 leading-snug ${
                              isActive ? "text-gray-900" : "text-gray-700"
                            }`}>
                              {v.title ?? `មេរៀន ${idx + 1}`}
                            </p>
                            {v.presented_by && (
                              <p className="text-xs text-gray-400 mt-1 truncate">{v.presented_by}</p>
                            )}
                            {vLocked && (
                              <p className="text-[11px] text-amber-700 mt-1 font-medium">សមាជិកភាព</p>
                            )}
                            {v.access_level === "free" && !vLocked && (
                              <p className="text-[11px] text-sky-600 mt-1 font-medium">ឥតគិតថ្លៃ</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </PageContainer>
  );
}
