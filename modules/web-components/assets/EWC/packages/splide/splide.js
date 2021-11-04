import { Splide } from './splide/splide';
import { css, html, LitElement } from 'lit';

export class ESplide extends LitElement {
	static get styles() {
		return css`
			._slides { display: none }
			.splide__list {
				margin-bottom: 2rem;
				min-height: 5rem;
			}
			.splide {
				max-width: 100%;
			}
			.splide__slide img {
				border-radius: var(--ewc-size-radius-xl) var(--ewc-size-radius-xl) 0 0;
				aspect-ratio: 16 / 9;
				width: 100%;
				object-fit: cover;
			}
			:host([fadeout]) .splide__slider {
				-webkit-mask-image: linear-gradient(to right, transparent 1%, rgba(0,0,0,0.3) 3%, black 7%, black 93%, rgba(0,0,0,0.3) 97%, transparent 99%);
			}
			@keyframes splide-loading{0%{transform:rotate(0)}to{transform:rotate(1turn)}}.splide__container{position:relative;box-sizing:border-box}.splide__list{margin:0!important;padding:0!important;width:max-content;will-change:transform}.splide.is-active .splide__list{display:flex}.splide__pagination{display:inline-flex;align-items:center;width:95%;flex-wrap:wrap;justify-content:center;margin:0}.splide__pagination li{list-style-type:none;display:inline-block;line-height:1;margin:0}.splide{visibility:hidden}.splide,.splide__slide{position:relative;outline:none}.splide__slide{box-sizing:border-box;list-style-type:none!important;margin:0;flex-shrink:0}.splide__slide img{vertical-align:bottom}.splide__slider{position:relative}.splide__spinner{position:absolute;top:0;left:0;right:0;bottom:0;margin:auto;display:inline-block;width:20px;height:20px;border-radius:50%;border:2px solid #999;border-left-color:transparent;animation:splide-loading 1s linear infinite}.splide__track{position:relative;z-index:0;overflow:hidden}.splide--draggable>.splide__track>.splide__list>.splide__slide{-webkit-user-select:none;user-select:none}.splide--fade>.splide__track>.splide__list{display:block}.splide--fade>.splide__track>.splide__list>.splide__slide{position:absolute;top:0;left:0;z-index:0;opacity:0}.splide--fade>.splide__track>.splide__list>.splide__slide.is-active{position:relative;z-index:1;opacity:1}.splide--rtl{direction:rtl}.splide--ttb>.splide__track>.splide__list{display:block}.splide--ttb>.splide__pagination{width:auto}.splide__arrow{position:absolute;z-index:1;top:50%;transform:translateY(-50%);width:2em;height:2em;border-radius:50%;display:flex;align-items:center;justify-content:center;border:none;padding:0;opacity:.7;background:#ccc}.splide__arrow svg{width:1.2em;height:1.2em}.splide__arrow:hover{cursor:pointer;opacity:.9}.splide__arrow:focus{outline:none}.splide__arrow--prev{left:1em}.splide__arrow--prev svg{transform:scaleX(-1)}.splide__arrow--next{right:1em}.splide__pagination{position:absolute;z-index:1;bottom:.5em;left:50%;transform:translateX(-50%);padding:0}.splide__pagination__page{display:inline-block;width:8px;height:8px;background:#ccc;border-radius:50%;margin:3px;padding:0;transition:transform .2s linear;border:none;opacity:.7}.splide__pagination__page.is-active{transform:scale(1.4);background:#fff}.splide__pagination__page:hover{cursor:pointer;opacity:.9}.splide__pagination__page:focus{outline:none}.splide__progress__bar{width:0;height:3px;background:#ccc}.splide--nav>.splide__track>.splide__list>.splide__slide{border:3px solid transparent}.splide--nav>.splide__track>.splide__list>.splide__slide.is-active{border-color:#000}.splide--nav>.splide__track>.splide__list>.splide__slide:focus{outline:none}.splide--rtl>.splide__arrows .splide__arrow--prev,.splide--rtl>.splide__track>.splide__arrows .splide__arrow--prev{right:1em;left:auto}.splide--rtl>.splide__arrows .splide__arrow--prev svg,.splide--rtl>.splide__track>.splide__arrows .splide__arrow--prev svg{transform:scaleX(1)}.splide--rtl>.splide__arrows .splide__arrow--next,.splide--rtl>.splide__track>.splide__arrows .splide__arrow--next{left:1em;right:auto}.splide--rtl>.splide__arrows .splide__arrow--next svg,.splide--rtl>.splide__track>.splide__arrows .splide__arrow--next svg{transform:scaleX(-1)}.splide--ttb>.splide__arrows .splide__arrow,.splide--ttb>.splide__track>.splide__arrows .splide__arrow{left:50%;transform:translate(-50%)}.splide--ttb>.splide__arrows .splide__arrow--prev,.splide--ttb>.splide__track>.splide__arrows .splide__arrow--prev{top:1em}.splide--ttb>.splide__arrows .splide__arrow--prev svg,.splide--ttb>.splide__track>.splide__arrows .splide__arrow--prev svg{transform:rotate(-90deg)}.splide--ttb>.splide__arrows .splide__arrow--next,.splide--ttb>.splide__track>.splide__arrows .splide__arrow--next{top:auto;bottom:1em}.splide--ttb>.splide__arrows .splide__arrow--next svg,.splide--ttb>.splide__track>.splide__arrows .splide__arrow--next svg{transform:rotate(90deg)}.splide--ttb>.splide__pagination{display:flex;flex-direction:column;bottom:50%;left:auto;right:.5em;transform:translateY(50%)}
		`;
	}

	appendSlides() {
		const splideList = this.shadowRoot.querySelector( '.splide__list' );

		[ ...this._slides ].forEach( ( slide ) => {
			const shadowSlide = document.createElement( 'li' );
			shadowSlide.classList.add( 'splide__slide' );
			shadowSlide.append( slide );
			splideList.append( shadowSlide );
		} );
	}

	get splideSettings() {
		const props = this.getAttributeNames();
		const settings = {};

		props.forEach( ( prop ) => {
			if ( 'perpage' === prop ) {
				prop = 'perPage';
			}
			if ( this[ prop ] ) {
				settings[ prop ] = this[ prop ];
			}
		} );

		return settings;
	}

	firstUpdated( changedProperties ) {
		super.firstUpdated( changedProperties );

		const splideElement = this.shadowRoot.querySelector( '.splide' );
		const options = this.splideSettings;
		this.appendSlides();

		new Splide( splideElement, options ).mount();
	}

	get _slides() {
		const slot = this.shadowRoot.querySelector( '._slides' );
		const childNodes = slot.assignedNodes( { flatten: true } );

		return childNodes.filter( node => 1 === node.nodeType );
	}

	static get properties() {
		return {
			type:			{ type: String, reflect: true },
			perPage:		{ type: Number, reflect: true },
			gap:			{ type: Number, reflect: true },
			focus:			{ type: String, reflect: true },
			pagination:		{ type: Boolean, reflect: true },
			autoplay:		{ type: Boolean, reflect: true },
			interval:		{ type: Number, reflect: true },
			pauseOnHover:	{ type: Boolean, reflect: true },
			pauseOnFocus:	{ type: Boolean, reflect: true },
			lazyLoad:		{ type: Boolean, reflect: true },
			swipeDistanceThreshold:	{ type: Number, reflect: true },
			flickVelocityThreshold:	{ type: Number, reflect: true },
			flickPower:		{ type: Number, reflect: true },
			flickMaxPages:	{ type: Number, reflect: true },
			isNavigation:	{ type: Boolean, reflect: true },
		};
	}

	render() {
		return html`
		<div class="splide">
			<div class="splide__slider">
				<div class="splide__track">
					<ul class="splide__list">
					</ul>
				</div>
			</div>
		</div>
		<slot class="_slides"></slot>`;
	}
}

window.customElements.define( 'e-splide', ESplide );
