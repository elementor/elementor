import Glide from './glide/glide.esm.min';
import {css, html, LitElement} from 'lit';
export class Button extends LitElement {
	static get styles() {
		return css`
		.btn {
		}`;
	}

	render() {
		return html`
			<div class="glide">
				<div class="glide__track" data-glide-el="track">...</div>

				<div class="glide__bullets" data-glide-el="controls[nav]">
					<button class="glide__bullet" data-glide-dir="=0"></button>
					<button class="glide__bullet" data-glide-dir="=1"></button>
					<button class="glide__bullet" data-glide-dir="=2"></button>
				</div>
			</div>`;
	}
}
