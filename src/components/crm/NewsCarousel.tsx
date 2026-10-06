import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Newspaper,
  Pause,
  Play,
} from "lucide-react";
import type { NewsItem } from "@/lib/mock-data";
import { formatDateBR } from "@/lib/helpers";
import { cn } from "@/lib/utils";

interface NewsCarouselProps {
  news: NewsItem[];
  autoPlayInterval?: number;
}

export function NewsCarousel({
  news,
  autoPlayInterval = 6000,
}: NewsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeSource, setActiveSource] = useState<string | null>(null);

  const sources = [...new Set(news.map((n) => n.source))];

  const filteredNews = activeSource
    ? news.filter((n) => n.source === activeSource)
    : news;

  const safeIndex = currentIndex % Math.max(filteredNews.length, 1);
  const currentNews = filteredNews[safeIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % filteredNews.length);
  }, [filteredNews.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? filteredNews.length - 1 : prev - 1,
    );
  }, [filteredNews.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeSource]);

  useEffect(() => {
    if (!isPlaying || filteredNews.length <= 1) return;
    const timer = setInterval(goNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPlaying, goNext, autoPlayInterval, filteredNews.length]);

  if (filteredNews.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      {/* Source tabs */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Newspaper className="h-4 w-4 text-[#0D7AB5]" strokeWidth={1.5} />
        <span className="text-sm font-black text-[#2F3570]">Notícias</span>
        <div className="ml-2 flex items-center gap-1.5">
          <button
            onClick={() => setActiveSource(null)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              activeSource === null
                ? "bg-[#0D7AB5] text-white"
                : "bg-[#F0F0F0] text-[#2F3570] hover:bg-[#0D7AB5]/10",
            )}
          >
            Todas
          </button>
          {sources.map((source) => (
            <button
              key={source}
              onClick={() =>
                setActiveSource(activeSource === source ? null : source)
              }
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                activeSource === source
                  ? "bg-[#0D7AB5] text-white"
                  : "bg-[#F0F0F0] text-[#2F3570] hover:bg-[#0D7AB5]/10",
              )}
            >
              {source}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-md p-1.5 text-[#2F3570]/60 transition-colors hover:bg-[#F0F0F0] hover:text-[#0D7AB5]"
            title={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
            ) : (
              <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Slide */}
      <a
        href={currentNews.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block p-5 transition-colors hover:bg-[#F0F0F0]/50"
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(true)}
      >
        <div className="mb-2 flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-[#0D7AB5]/10 text-xs text-[#0D7AB5]"
          >
            {currentNews.category}
          </Badge>
          <span className="rounded-full bg-[#2F3570]/10 px-2 py-0.5 text-[10px] font-medium text-[#2F3570]">
            {currentNews.source}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDateBR(currentNews.date)}
          </span>
          <ExternalLink
            className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            strokeWidth={1.5}
          />
        </div>
        <h3 className="text-base font-black leading-snug text-[#2F3570]">
          {currentNews.title}
        </h3>
        <p className="mt-1.5 text-sm font-light leading-relaxed text-muted-foreground">
          {currentNews.summary}
        </p>
      </a>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <button
          onClick={goPrev}
          className="rounded-md p-1.5 text-[#2F3570]/60 transition-colors hover:bg-[#F0F0F0] hover:text-[#0D7AB5]"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-1.5">
          {filteredNews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === safeIndex
                  ? "w-4 bg-[#0D7AB5]"
                  : "w-1.5 bg-[#0D7AB5]/20 hover:bg-[#0D7AB5]/40",
              )}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          className="rounded-md p-1.5 text-[#2F3570]/60 transition-colors hover:bg-[#F0F0F0] hover:text-[#0D7AB5]"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
