"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { slides } from "@/data/home";

const subscribeToReducedMotion = (onChange: () => void) => {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
};
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerReducedMotion = () => false;
const introDescription = "Nous vous accompagnons dans la conception, la réalisation et le suivi de vos projets agricoles, d’élevage et d’aquaculture en Côte d’Ivoire.";
const heroHeadlines = [
  { first: "De l’eau à la production,", second: "nous accompagnons vos", accent: "projets piscicoles" },
  { first: "De la conception au suivi,", second: "des solutions pour", accent: "vos projets agricoles" },
  { first: "Pour produire durablement,", second: "un accompagnement concret", accent: "sur le terrain" },
];

export default function Hero() {
  const [showImages, setShowImages] = useState(false);
  const [index, setIndex] = useState(0);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [descriptionDone, setDescriptionDone] = useState(false);
  const [captionReady, setCaptionReady] = useState(false);
  const [actionsReady, setActionsReady] = useState(false);
  const [controlsReady, setControlsReady] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % slides.length);
      setCycle((current) => current + 1);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [index, reduced, showImages]);

  useEffect(() => {
    if (reduced) {
      setTypedChars(introDescription.length);
      setDescriptionDone(true);
      return;
    }

    let count = 0;
    setTypedChars(0);
    setDescriptionDone(false);
    const timer = window.setInterval(() => {
      count = Math.min(count + 1, introDescription.length);
      setTypedChars(count);
      if (count >= introDescription.length) {
        window.clearInterval(timer);
        setDescriptionDone(true);
      }
    }, 40);
    return () => window.clearInterval(timer);
  }, [reduced]);

  useEffect(() => {
    if (!descriptionDone || reduced) return;
    const timer = window.setInterval(() => {
      setHeadlineIndex((current) => (current + 1) % heroHeadlines.length);
    }, 9000);
    return () => window.clearInterval(timer);
  }, [descriptionDone, reduced]);

  useEffect(() => {
    if (reduced) {
      setCaptionReady(true);
      setActionsReady(true);
      setControlsReady(true);
    }
  }, [reduced]);

  const currentSlide = slides[index];
  const currentHeadline = heroHeadlines[headlineIndex];
  const changeSlide = (delta: number) => {
    setIndex((current) => (current + delta + slides.length) % slides.length);
    setShowImages(true);
    setCycle((current) => current + 1);
  };

  return (
    <section className="h-hero" aria-label="Présentation de MOAYE SERVICES">
      <video
        className={`h-video${showImages ? " is-hidden" : ""}`}
        autoPlay={!reduced}
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/videos/homepage-hero.mp4" type="video/mp4" />
      </video>
      {showImages && (
        <div className="h-image-slide" aria-hidden="true">
          <Image
            key={currentSlide.img}
            src={currentSlide.img}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectPosition: currentSlide.img === "/moaye-team-collaboration.jpg" ? "50% 20%" : undefined }}
          />
        </div>
      )}
      <div className="h-veil" />

      <div className="wrap h-content">
        <div className="h-text">
          <span className="tag tag-glass">
            <span className="hero-tag-desktop">Côte d&apos;Ivoire · Agriculture · Élevage · Aquaculture</span>
            <span className="hero-tag-mobile">Agriculture · Élevage · Aquaculture</span>
          </span>
          <h1
            className={`h-title-after-typing${descriptionDone ? " is-visible" : ""}`}
            onTransitionEnd={(event) => {
              if (descriptionDone && event.propertyName === "opacity") setCaptionReady(true);
            }}
          >
            <span key={headlineIndex} className="h-title-swap">
              <span className="h-title-line">{currentHeadline.first}</span>
              <span className="h-title-line">{currentHeadline.second} <span className="h-title-highlight">{currentHeadline.accent}</span></span>
            </span>
          </h1>
          <p data-full-text={introDescription} aria-label={introDescription}>
            <span className="h-typing-visible" aria-hidden="true">
              {introDescription.slice(0, typedChars)}
              {typedChars < introDescription.length ? <span className="h-typing-caret" /> : null}
            </span>
          </p>
          <div className={`h-actions${actionsReady ? " is-visible" : ""}`}>
            <Link className="btn btn-amber" href="/services">Découvrir nos services</Link>
            <Link
              className="btn btn-white"
              href="/contact"
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) setControlsReady(true);
              }}
            >
              Nous contacter
            </Link>
          </div>
        </div>

        <div className="wrap h-showcase">
          <aside
            className={`h-caption${captionReady ? " is-visible" : ""}`}
            aria-label={currentSlide.domain}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget) setActionsReady(true);
            }}
          >
            <div key={index} className="h-caption-copy">
              <small>{currentSlide.domain}</small>
              <strong>{currentSlide.title}</strong>
            </div>
            <div className="h-caption-actions">
              <Link className="btn btn-white btn-sm" href={currentSlide.href}>
                <span key={currentSlide.cta} className="h-caption-label">{currentSlide.cta}</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <div className={`h-bar${controlsReady ? " is-visible" : ""}`}>
        <div className="wrap h-bar-in">
          <div className="grow" role="group" aria-label="Choisir une image">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.img}
                className={`seg${slideIndex < index ? " past" : ""}${slideIndex === index ? " on" : ""}${reduced || !showImages ? " paused" : ""}`}
                aria-label={`Afficher l’image ${slideIndex + 1} : ${slide.domain}`}
                aria-current={slideIndex === index}
                onClick={() => {
                  setIndex(slideIndex);
                  setShowImages(true);
                  setCycle((current) => current + 1);
                }}
              >
                <i><b key={slideIndex === index ? cycle : "idle"} /></i>
              </button>
            ))}
          </div>
          <span className="h-slide-count">{index + 1} / {slides.length}</span>
          <div className="h-image-controls">
            <button className="ctl" type="button" onClick={() => changeSlide(-1)} aria-label="Image précédente">‹</button>
            <button
              className="ctl"
              type="button"
              onClick={() => setShowImages((current) => !current)}
              aria-label={showImages ? "Revenir à la vidéo" : "Afficher le diaporama d’images"}
            >
              {!showImages ? (
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M8 5v14M16 5v14" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button className="ctl" type="button" onClick={() => changeSlide(1)} aria-label="Image suivante">›</button>
          </div>
        </div>
      </div>
    </section>
  );
}
