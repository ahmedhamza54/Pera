'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { X } from 'lucide-react';

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
  onClick?: () => void;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  accentColor?: string;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  items = [],
  socialItems = [],
  displaySocials = true,
  accentColor = 'hsl(var(--primary))',
  onMenuOpen,
  onMenuClose
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const overlay = overlayRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;

      if (!panel || !overlay || !plusH || !plusV || !icon) return;

      gsap.set(overlay, { opacity: 0 });
      gsap.set(panel, { yPercent: -100 });
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
    });
    return () => ctx.revert();
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;

    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !overlay) return;

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
    const socialTitle = panel.querySelector('.sm-socials-title') as HTMLElement | null;
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link')) as HTMLElement[];

    gsap.set(itemEls, { yPercent: 100, opacity: 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0, y: 20 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 20, opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        busyRef.current = false;
      }
    });

    tl.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0);
    tl.to(panel, { yPercent: 0, duration: 0.6, ease: 'power4.out' }, 0.1);

    if (itemEls.length) {
      tl.to(
        itemEls,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' }
        },
        0.3
      );
    }

    if (socialTitle) {
      tl.to(socialTitle, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.5);
    }

    if (socialLinks.length) {
      tl.to(
        socialLinks,
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out',
          stagger: { each: 0.08 }
        },
        0.6
      );
    }
  }, []);

  const playClose = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;

    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !overlay) return;

    const tl = gsap.timeline({
      onComplete: () => {
        busyRef.current = false;
      }
    });

    tl.to(panel, { yPercent: -100, duration: 0.4, ease: 'power3.in' }, 0);
    tl.to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.2);
  }, []);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!icon || !h || !v) return;

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0);
    } else {
      gsap
        .timeline({ defaults: { ease: 'power3.inOut' } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0);
    }
  }, []);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }

    animateIcon(target);
  }, [playOpen, playClose, animateIcon, onMenuOpen, onMenuClose]);

  return (
    <>
      <button
        ref={toggleBtnRef}
        className="relative inline-flex items-center justify-center bg-transparent border-0 cursor-pointer h-9 w-9 text-foreground hover:text-foreground/80 transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={toggleMenu}
        type="button"
      >
        <span
          ref={iconRef}
          className="relative w-[18px] h-[18px] inline-flex items-center justify-center"
          aria-hidden="true"
        >
          <span
            ref={plusHRef}
            className="absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2"
          />
          <span
            ref={plusVRef}
            className="absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2"
          />
        </span>
      </button>

      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onClick={toggleMenu}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 left-0 right-0 w-full max-w-lg mx-auto h-[75vh] bg-card border-b border-border flex flex-col overflow-hidden z-50 shadow-2xl rounded-b-2xl ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{ ['--sm-accent' as any]: accentColor } as React.CSSProperties}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border bg-background/95 backdrop-blur">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            type="button"
            onClick={toggleMenu}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-accent transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <ul className="list-none m-0 p-0 flex flex-col gap-4" role="list">
            {items && items.length ? (
              items.map((it, idx) => (
                <li className="relative overflow-hidden" key={it.label + idx}>
                  {it.onClick ? (
                    <button
                      className="block text-foreground font-semibold text-[2.5rem] leading-none tracking-tight cursor-pointer transition-colors duration-200 hover:text-primary no-underline text-left w-full"
                      aria-label={it.ariaLabel}
                      onClick={() => {
                        try {
                          it.onClick?.()
                        } finally {
                          toggleMenu()
                        }
                      }}
                      type="button"
                    >
                      <span className="sm-panel-itemLabel inline-block">{it.label}</span>
                    </button>
                  ) : (
                    <a
                      className="block text-foreground font-semibold text-[2.5rem] leading-none tracking-tight cursor-pointer transition-colors duration-200 hover:text-primary no-underline"
                      href={it.link}
                      aria-label={it.ariaLabel}
                      onClick={toggleMenu}
                    >
                      <span className="sm-panel-itemLabel inline-block">{it.label}</span>
                    </a>
                  )}
                </li>
              ))
            ) : null}
          </ul>

          {displaySocials && socialItems && socialItems.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border flex flex-col gap-4">
              <h3 className="sm-socials-title m-0 text-sm font-semibold text-primary uppercase tracking-wide">
                Socials
              </h3>
              <ul className="list-none m-0 p-0 flex flex-row items-center gap-4 flex-wrap" role="list">
                {socialItems.map((s, i) => (
                  <li key={s.label + i}>
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm-socials-link text-base font-medium text-muted-foreground no-underline transition-colors duration-200 hover:text-primary"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};