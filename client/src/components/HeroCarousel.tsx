import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  title: string;
  description: string;
  image: string;
}

const SLIDES: Slide[] = [
  {
    title: "What It Does",
    description: "Spirit Framework is a decentralized learning intelligence platform built on the Electroneum blockchain. The core product, Spirit Journal, allows users to document their learning journeys and personal growth experiences.",
    image: "/slides/what-it-does.svg"
  },
  {
    title: "Who It's For",
    description: "Lifelong learners, educators looking for insights into learning patterns, educational technology developers, and anyone interested in contributing to a collective learning ecosystem.",
    image: "/slides/who-its-for.svg"
  },
  {
    title: "Problems It Solves",
    description: "Traditional education's one-size-fits-all approach, unrewarded knowledge sharing, disconnected learning tools, and data-poor learning platforms.",
    image: "/slides/problems-solved.svg"
  }
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  // Auto-advance slides
  useEffect(() => {
    if (!emblaApi) return;
    const intervalId = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {SLIDES.map((slide, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 relative grid md:grid-cols-2 gap-8 items-center"
            >
              <div className="space-y-4 p-8">
                <h2 className="text-3xl font-bold text-gray-900">{slide.title}</h2>
                <p className="text-lg text-gray-600">{slide.description}</p>
              </div>
              <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          onClick={scrollNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0">
        <div className="flex justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === selectedIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
