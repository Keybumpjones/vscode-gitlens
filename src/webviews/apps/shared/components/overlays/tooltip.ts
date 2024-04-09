import type SlTooltip from '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';

@customElement('gl-tooltip')
export class Tooltip extends LitElement {
	static override styles = css`
		sl-tooltip::part(body) {
			border: 1px solid var(--gl-tooltip-border-color);
			box-shadow: 0 2px 8px var(--gl-tooltip-shadow);
		}

		sl-tooltip::part(base__arrow) {
			border: 1px solid var(--gl-tooltip-border-color);
			z-index: 1;
			/* --arrow-color: var(--gl-tooltip-border-color); */
		}

		/* TODO@eamodio doesn't work if the tooltip gets repositioned */

		:host([placement^='top']) sl-tooltip::part(base__arrow) {
			border-bottom-width: 0;
			border-right-width: 0;
		}

		:host([placement^='bottom']) sl-tooltip::part(base__arrow) {
			border-top-width: 0;
			border-left-width: 0;
		}

		:host([placement^='left']) sl-tooltip::part(base__arrow) {
			border-bottom-width: 0;
			border-left-width: 0;
		}

		:host([placement^='right']) sl-tooltip::part(base__arrow) {
			border-top-width: 0;
			border-right-width: 0;
		}
	`;

	@property({ reflect: true })
	placement?: SlTooltip['placement'] = 'top';

	override render() {
		return html`<sl-tooltip .placement=${this.placement}>
			<slot></slot>
			<div slot="content">
				<slot name="content" class="content"></slot>
			</div>
		</sl-tooltip>`;
	}
}