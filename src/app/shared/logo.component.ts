import { Component, input } from '@angular/core';

/**
 * Marca "esferaviva" reutilizável: o símbolo (globo com meridiano + paralelos,
 * verde a brotar em baixo) e, opcionalmente, o wordmark ao lado.
 *
 * Recriado em HTML/SVG (em vez de <img>) para herdar as cores da marca via
 * variáveis CSS e ficar nítido a qualquer tamanho, com fundo transparente.
 */
@Component({
  selector: 'app-logo',
  template: `
    <span class="logo" [style.--logo-size.px]="size()">
      <svg class="mark" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <circle cx="60" cy="60" r="44" class="cream" stroke-width="5" />
        <line x1="60" y1="14" x2="60" y2="106" class="cream" stroke-width="5" />
        <path d="M60 26 C46 32 38 42 32 56" class="cream" stroke-width="5" stroke-linecap="round" />
        <path d="M60 26 C74 32 82 42 88 56" class="cream" stroke-width="5" stroke-linecap="round" />
        <path d="M60 44 C48 50 41 58 36 70" class="cream" stroke-width="5" stroke-linecap="round" />
        <path d="M60 44 C72 50 79 58 84 70" class="cream" stroke-width="5" stroke-linecap="round" />
        <path d="M60 62 C50 68 45 75 41 85" class="green" stroke-width="5" stroke-linecap="round" />
        <path d="M60 62 C70 68 75 75 79 85" class="green" stroke-width="5" stroke-linecap="round" />
      </svg>
      @if (wordmark()) {
        <span class="word">
          <span class="word__1">esfera</span><span class="word__2">viva</span>
        </span>
      }
    </span>
  `,
  styles: [
    `
      .logo {
        display: inline-flex;
        align-items: center;
        gap: 0.5em;
        line-height: 1;
      }

      .mark {
        width: var(--logo-size, 32px);
        height: var(--logo-size, 32px);
        display: block;
        flex: none;
      }

      .mark .cream {
        stroke: var(--ev-cream);
      }
      .mark .green {
        stroke: var(--ev-green-bright);
      }

      .word {
        font-size: calc(var(--logo-size, 32px) * 0.62);
        font-weight: 500;
        letter-spacing: -0.02em;
        color: var(--ev-cream);
        white-space: nowrap;
      }
      .word__2 {
        font-weight: 700;
        color: var(--ev-green-bright);
      }
    `,
  ],
})
export class LogoComponent {
  /** Lado do símbolo, em pixéis. */
  readonly size = input<number>(32);
  /** Mostrar o wordmark "esferaviva" ao lado do símbolo. */
  readonly wordmark = input<boolean>(false);
}
