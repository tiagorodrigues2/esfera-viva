import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LogoComponent } from './logo.component';

/**
 * Barra de navegação fixa, presente em todas as rotas. Translúcida com blur,
 * para funcionar tanto sobre a landing como sobreposta ao mapa.
 */
@Component({
  selector: 'app-toolbar',
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  template: `
    <header class="toolbar">
      <a class="brand" routerLink="/" aria-label="Início">
        <app-logo [size]="30" [wordmark]="true" />
      </a>

      <nav class="nav">
        <a
          routerLink="/"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          >Início</a
        >
        <a routerLink="/explorar" routerLinkActive="active">Explorar</a>
      </nav>
    </header>
  `,
  styles: [
    `
      .toolbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        height: var(--ev-toolbar-h);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0 clamp(0.9rem, 3vw, 1.75rem);
        background: rgba(17, 22, 15, 0.62);
        backdrop-filter: blur(14px) saturate(120%);
        -webkit-backdrop-filter: blur(14px) saturate(120%);
        border-bottom: 1px solid var(--ev-line);
      }

      .brand {
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        border-radius: 12px;
      }

      .nav {
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      .nav a {
        --pad-x: clamp(0.7rem, 2.5vw, 1.05rem);
        padding: 0.5rem var(--pad-x);
        border-radius: 999px;
        text-decoration: none;
        color: var(--ev-cream-dim);
        font-size: 0.95rem;
        font-weight: 600;
        letter-spacing: -0.01em;
        transition:
          color 0.15s ease,
          background-color 0.15s ease;
      }

      .nav a:hover {
        color: var(--ev-cream);
        background: rgba(247, 245, 238, 0.08);
      }

      .nav a.active {
        color: var(--ev-bg);
        background: var(--ev-green-bright);
      }

      :focus-visible {
        outline: 2px solid var(--ev-green-bright);
        outline-offset: 2px;
      }

      @media (max-width: 600px) {
        .nav a {
          font-size: 0.9rem;
        }
      }
    `,
  ],
})
export class ToolbarComponent {}
