"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

const slides = [
  {
    image: "https://picsum.photos/1200/500",
    alt: "Gas cylinder delivery",
    title: "Fast & Reliable Gas Delivery",
    description: "Get your gas cylinders delivered to your doorstep, hassle-free.",
    hint: "delivery truck"
  },
  {
    image: "https://picsum.photos/1200/500",
    alt: "Easy online ordering",
    title: "Order Online in Minutes",
    description: "Simple and convenient online ordering system.",
    hint: "person ordering online"
  },
  {
    image: "https://picsum.photos/1200/500",
    alt: "Gas for home and business",
    title: "For Home & Business",
    description: "We supply gas for both residential and commercial needs.",
    hint: "restaurant kitchen"
  },
]

export function ImageCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={index}>
            <div className="relative h-64 md:h-[500px] w-full">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill={true}
                objectFit="cover"
                className="rounded-lg"
                data-ai-hint={slide.hint}
              />
              <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                  {slide.title}
                </h2>
                <p className="text-sm md:text-lg text-white/90">
                  {slide.description}
                </p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex" />
    </Carousel>
  )
}
