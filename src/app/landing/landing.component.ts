import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LogoComponent } from '../shared/logo.component';

/**
 * Página inicial (rota "/"). Hero minimal com a marca e um cartão call-to-action
 * que leva ao globo interativo ("/explorar"). Totalmente responsiva.
 */
@Component({
  selector: 'app-landing',
  imports: [RouterLink, LogoComponent],
  template: `
    <main class="landing">
      <section class="hero">
        <app-logo class="hero__mark" [size]="112" />

        <h1 class="hero__title">
          <span>esfera</span><span class="accent">viva</span>
        </h1>

        <p class="hero__tagline">A vida do planeta, explorada região a região.</p>

        <a class="cta" routerLink="/explorar">
          <span class="cta__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
              <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" stroke="currentColor" stroke-width="1.8" />
            </svg>
          </span>
          <span class="cta__text">
            <span class="cta__title">Explorar o globo</span>
            <span class="cta__sub">Navega pela Terra em 3D</span>
          </span>
          <span class="cta__arrow" aria-hidden="true">→</span>
        </a>
      </section>
    </main>
  `,
  styles: [
    `
      .landing {
        min-height: 100svh;
        padding: calc(var(--ev-toolbar-h) + 2rem) 1.25rem 2.5rem;
        display: grid;
        place-items: center;
        background:
          radial-gradient(
            120% 90% at 50% -10%,
            rgba(95, 189, 134, 0.16),
            transparent 60%
          ),
          linear-gradient(180deg, var(--ev-bg) 0%, var(--ev-bg-2) 100%);
      }

      .hero {
        width: min(640px, 100%);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .hero__mark {
        filter: drop-shadow(0 8px 28px rgba(0, 0, 0, 0.35));
      }

      .hero__title {
        margin: 1.25rem 0 0;
        font-size: clamp(2.75rem, 11vw, 4.75rem);
        font-weight: 500;
        letter-spacing: -0.03em;
        line-height: 1;
        color: var(--ev-cream);
      }
      .hero__title .accent {
        font-weight: 700;
        color: var(--ev-green-bright);
      }

      .hero__tagline {
        margin: 1rem 0 0;
        max-width: 34ch;
        font-size: clamp(1.05rem, 3.6vw, 1.3rem);
        font-weight: 400;
        line-height: 1.45;
        color: var(--ev-cream-dim);
      }

      .cta {
        margin-top: 2.5rem;
        width: min(420px, 100%);
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.15rem;
        text-align: left;
        text-decoration: none;
        background: var(--ev-surface);
        border: 1px solid var(--ev-line);
        border-radius: var(--ev-radius-lg);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        transition:
          transform 0.18s ease,
          background-color 0.18s ease,
          border-color 0.18s ease;
      }
      .cta:hover {
        transform: translateY(-2px);
        background: var(--ev-surface-2);
        border-color: rgba(95, 189, 134, 0.4);
      }
      .cta:focus-visible {
        outline: 2px solid var(--ev-green-bright);
        outline-offset: 3px;
      }

      .cta__icon {
        flex: none;
        width: 48px;
        height: 48px;
        display: grid;
        place-items: center;
        border-radius: 14px;
        color: var(--ev-bg);
        background: var(--ev-green-bright);
      }
      .cta__icon svg {
        width: 28px;
        height: 28px;
      }

      .cta__text {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        flex: 1 1 auto;
      }
      .cta__title {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--ev-cream);
      }
      .cta__sub {
        font-size: 0.9rem;
        color: var(--ev-cream-dim);
      }

      .cta__arrow {
        flex: none;
        font-size: 1.5rem;
        color: var(--ev-green-bright);
        transition: transform 0.18s ease;
      }
      .cta:hover .cta__arrow {
        transform: translateX(4px);
      }
    `,
  ],
})
export class LandingComponent {}
