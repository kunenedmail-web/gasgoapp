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
import Image from "next/image"

const slides = [
  {
    image: "https://storage.googleapis.com/altara-6d528.appspot.com/projects/2539097725916055552/files/54cc92d4-1a3b-488f-9a1f-1da55ab1c5b0.png_2024-09-06T14:48:47.375Z",
    alt: "An orange Total gas cylinder.",
    title: "9kg Gas Refill on R320!",
    description: "FREE DELIVERY. Use promo code GET25%OFF. Terms and conditions apply.",
    hint: "gas cylinder offer"
  },
  {
    image: "https://storage.googleapis.com/altara-6d528.appspot.com/projects/2539097725916055552/files/420456cc-46b0-4f96-8576-9040989f6671.png_2024-09-06T15:23:18.995Z",
    alt: "Gas delivery for companies",
    title: "You're a company? No Problem",
    description: "We provide on-demand gas refill services to corporate and industrial clients across South Africa.",
    hint: "corporate gas delivery"
  }
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
                objectFit="contain"
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
