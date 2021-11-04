import { html, css, LitElement } from 'lit';

class FlipBox extends LitElement {
	static properties = {
		effect: { type: String, reflect: true },
		trigger: { type: String, reflect: true },
		flipped: { type: Boolean, reflect: true },
		icon: { type: String },
	};

	constructor() {
		super();
		this.trigger = 'hover';
		this.flipped = false;
		this.effect = 'flip-right';
	}

	connectedCallback() {
		super.connectedCallback();
		this._bindEvents();
	}

	_bindEvents() {
		if ( 'hover' === this.trigger ) {
			this.addEventListener( 'mouseenter', () => this.flipped = true );
			this.addEventListener( 'mouseleave', () => this.flipped = false );
		}

		if ( 'click' === this.trigger ) {
			this.addEventListener( 'click', () => this.flipped = ! this.flipped );
		}
	}

	static styles = css`
		* { box-sizing: border-box }
		::slotted(*) {
			margin: 0;
			box-sizing: border-box;
		}

		:host {
			--d3d: 0;
			--loaded: 1;
			display: grid;
			grid-template-columns: 1fr;
			perspective: 1000px;
			transform-style: preserve-3d;
			min-height: 100px;
			text-align: var(--e-flip-box-text-align, center);
		}

		.front, .back {
			border-radius: 12px;
			grid-area: 1/1/1/1;
			width: 100%;
			height: 100%;
			backface-visibility: hidden;
			transform:
			rotateY(calc(var(--flip-y, 0) * 180deg))
			rotateX(calc(var(--flip-x, 0) * 180deg))
			translateY(calc(var(--move-y, 0) * 100%))
			translateX(calc(var(--move-x, 0) * 100%));
			transition: transform 500ms ease-in-out;
				transform-style: preserve-3d;
			border: var(--border-color, #ccc) 1px solid;
		}

		.front {
			background-color: #f4f4f4;
			z-index: 2;
			--flip-y: var(--flip-y-front);
			--flip-x: var(--flip-x-front);
			--move-y: var(--move-y-front);
			--move-x: var(--move-x-front);
		}

		.back {
			background-color: #f4f0fa;
			--flip-y: var(--flip-y-back);
			--flip-x: var(--flip-x-back);
			--move-y: var(--move-y-back);
			--move-x: var(--move-x-back);
		}

		.inner {
			border-radius: 12px;
			display: flex;
			gap: 1rem;
			flex-direction: column;
			height: 100%;
			width: 100%;
			padding: 1.5rem;
			justify-content: center;
				transform:
			translateZ(calc(var(--pop) * 90px))
			scale(max(0.911, (1 - var(--pop))));
		}

		/* Pop (3D Effect) */
		:host([pop]) { --pop: 1 }

		/* Flip Effects */
		/* Flip Right */
		:host([effect="flip-right"]:not([flipped])) { --flip-y-back: -1 }
		:host([effect="flip-right"][flipped]) { --flip-y-front: 1 }
		/* Flip Left */
		:host([effect="flip-left"]:not([flipped])) { --flip-y-back: 1 }
		:host([effect="flip-left"][flipped]) { --flip-y-front: -1 }
		/* Flip Up */
		:host([effect="flip-up"]:not([flipped])) { --flip-x-back: -1 }
		:host([effect="flip-up"][flipped]) { --flip-x-front: 1 }
		/* Flip Down */
		:host([effect="flip-down"]:not([flipped])) { --flip-x-back: 1 }
		:host([effect="flip-down"][flipped]) { --flip-x-front: -1 }

		/* Move Effects */
		:host(:is([effect^="push"],[effect^="slide"])) { overflow: hidden }

		/* Push Right */
		:host([effect="push-right"]:not([flipped])) { --move-x-back: -1 }
		:host([effect="push-right"][flipped]) { --move-x-front: 1 }
		/* Push Left */
		:host([effect="push-left"]:not([flipped])) { --move-x-back: 1 }
		:host([effect="push-left"][flipped]) { --move-x-front: -1 }
		/* Push Up */
		:host([effect="push-down"]:not([flipped])) { --move-y-back: -1 }
		:host([effect="push-down"][flipped]) { --move-y-front: 1 }
		/* Push Down */
		:host([effect="push-up"]:not([flipped])) { --move-y-back: 1 }
		:host([effect="push-up"][flipped]) { --move-y-front: -1 }

		/* Slide Right */
		:host([effect="slide-right"][flipped]) { --move-x-front: 1 }
		/* Slide Left */
		:host([effect="slide-left"][flipped]) { --move-x-front: -1 }
		/* Slide Up */
		:host([effect="slide-down"][flipped]) { --move-y-front: 1 }
		/* Slide Down */
		:host([effect="slide-up"][flipped]) { --move-y-front: -1 }`;

	render() {
		return html`
			<div class="front">
				<div class="inner">
					<slot name="icon"></slot>
					<slot name="front-title"></slot>
					<slot name="front-description"></slot>
				</div>
			</div>
			<div class="back">
				<div class="inner">
					<slot name="back-title"></slot>
					<slot name="back-description"></slot>
					<slot name="button"></slot>
				</div>
			</div>`;
	}
}

customElements.define( 'e-flip-box', FlipBox );
