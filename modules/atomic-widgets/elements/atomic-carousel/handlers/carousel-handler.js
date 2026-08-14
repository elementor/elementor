import { register } from '@elementor/frontend-handlers';
import EmblaCarousel from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';

/**
 * Frontend behaviour of `e-carousel`.
 *
 * Embla is headless, so everything visible here is our own DOM: it reports where the snap points
 * are and we translate that into arrow state, dots and ARIA. No Alpine, unlike tabs and
 * background video — the carousel's state is not expressible as template bindings, and the arrows
 * and dots need imperative wiring to the engine anyway.
 */

const TYPE = {
	viewport: 'e-carousel-viewport',
	container: 'e-carousel-container',
	slide: 'e-carousel-slide',
	prev: 'e-carousel-arrow-prev',
	next: 'e-carousel-arrow-next',
	pagination: 'e-carousel-pagination',
	autoplayToggle: 'e-carousel-autoplay-toggle',
};

const DOT_CLASS = 'e-carousel__dot';
const ACTIVE_DOT_CLASS = 'e--selected';

// Embla's `duration` is a spring constant, not a time: the documented usable band is 20-60, and
// 100 draws a single transition out to roughly nine seconds. The panel stores milliseconds so the
// saved value stays independent of the engine, and this maps it onto the band.
const DURATION_MIN = 12;
const DURATION_MAX = 60;
const MS_MIN = 200;
const MS_MAX = 2000;

function msToEmblaDuration( ms ) {
	const clamped = Math.min( Math.max( Number( ms ) || MS_MIN, MS_MIN ), MS_MAX );
	const ratio = ( clamped - MS_MIN ) / ( MS_MAX - MS_MIN );

	return Math.round( DURATION_MIN + ( ratio * ( DURATION_MAX - DURATION_MIN ) ) );
}

const child = ( root, type ) => root?.querySelector( `:scope > [data-e-type="${ type }"]` );

function prefersReducedMotion( win ) {
	return Boolean( win.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches );
}

register( {
	elementType: 'e-carousel',
	id: 'e-carousel-handler',
	callback: ( { element, settings, signal } ) => {
		const doc = element.ownerDocument;
		const win = doc.defaultView;

		const viewport = child( element, TYPE.viewport );
		const container = child( viewport, TYPE.container );

		if ( ! viewport || ! container ) {
			return;
		}

		const prevBtn = child( element, TYPE.prev );
		const nextBtn = child( element, TYPE.next );
		const pagination = child( element, TYPE.pagination );

		const isEditor = 'true' === element.dataset.eCarouselEditor;
		const reducedMotion = prefersReducedMotion( win );
		const isFade = 'fade' === settings.transition_type;

		// Autoplay animates content the visitor did not ask for, and dragging fights the editor's
		// own drag and drop, so both are frontend-only. Loop is disabled while editing so the
		// slide order on canvas always matches the Structure panel.
		const autoplayEnabled = ! isEditor && ! reducedMotion && Boolean( settings.autoplay );

		const plugins = [];

		if ( autoplayEnabled ) {
			plugins.push(
				Autoplay( {
					delay: Number( settings.autoplay_delay ) || 5000,
					stopOnMouseEnter: false !== settings.pause_on_hover,
					stopOnInteraction: false !== settings.pause_on_interaction,
					stopOnFocusIn: true,
					rootNode: () => element,
				} ),
			);
		}

		if ( isFade ) {
			plugins.push( Fade() );
		}

		const embla = EmblaCarousel(
			viewport,
			{
				loop: ! isEditor && Boolean( settings.loop ),
				align: 'start',
				slidesToScroll: isFade ? 1 : Number( settings.slides_to_scroll ) || 1,
				duration: reducedMotion ? 0 : msToEmblaDuration( settings.transition_speed ),
				// Embla only reverses its own axis; the DOM has to agree with it or the carousel
				// scrolls the wrong way. Arrow placement is handled by logical CSS insets.
				direction: 'rtl' === ( element.closest( '[dir]' )?.getAttribute( 'dir' ) || doc.dir ) ? 'rtl' : 'ltr',
				containScroll: isFade ? false : 'trimSnaps',
				watchDrag: ! isEditor,
			},
			plugins,
		);

		const slides = () =>
			Array.from( container.children ).filter( ( el ) => TYPE.slide === el.dataset.eType );

		function labelSlides() {
			const all = slides();

			all.forEach( ( slide, index ) => {
				slide.setAttribute(
					'aria-label',
					/* Translators: 1: Slide number, 2: Total slides. */
					`${ index + 1 } of ${ all.length }`,
				);
			} );
		}

		function syncArrows() {
			if ( ! prevBtn || ! nextBtn ) {
				return;
			}

			// Nothing can scroll, so the arrows would be decoration.
			const nothingToScroll = embla.scrollSnapList().length <= 1;
			prevBtn.hidden = nothingToScroll;
			nextBtn.hidden = nothingToScroll;

			// `aria-disabled` rather than `disabled`: a focused button that becomes `disabled`
			// drops focus to <body>, which silently ends the visitor's keyboard journey through
			// the carousel. Reproduced in the POC; the click guard below keeps the behaviour.
			prevBtn.setAttribute( 'aria-disabled', embla.canScrollPrev() ? 'false' : 'true' );
			nextBtn.setAttribute( 'aria-disabled', embla.canScrollNext() ? 'false' : 'true' );
		}

		function buildDots() {
			if ( ! pagination ) {
				return;
			}

			pagination.textContent = '';

			const snaps = embla.scrollSnapList();
			pagination.hidden = snaps.length <= 1;

			snaps.forEach( ( _, index ) => {
				const dot = doc.createElement( 'button' );

				dot.type = 'button';
				dot.className = DOT_CLASS;
				dot.setAttribute( 'role', 'tab' );
				/* Translators: %d: Slide number. */
				dot.setAttribute( 'aria-label', `Go to slide ${ index + 1 }` );
				dot.addEventListener( 'click', () => embla.scrollTo( index ), { signal } );

				pagination.appendChild( dot );
			} );

			syncDots();
		}

		function syncDots() {
			if ( ! pagination ) {
				return;
			}

			const selected = embla.selectedScrollSnap();

			Array.from( pagination.children ).forEach( ( dot, index ) => {
				const isSelected = index === selected;

				dot.setAttribute( 'aria-selected', isSelected ? 'true' : 'false' );
				dot.classList.toggle( ACTIVE_DOT_CLASS, isSelected );
			} );
		}

		/**
		 * WCAG 2.2.2 requires a way to stop moving content. The button is created here rather than
		 * being an eighth sub-element: the saved child tree cannot be migrated, so adding a
		 * persisted node later would leave every existing document without it.
		 */
		function setupAutoplayToggle() {
			const existing = child( element, TYPE.autoplayToggle );

			if ( ! autoplayEnabled || false === settings.show_autoplay_button ) {
				existing?.remove();
				return;
			}

			const toggle = existing ?? doc.createElement( 'button' );

			toggle.type = 'button';
			toggle.dataset.eType = TYPE.autoplayToggle;
			toggle.className = 'e-carousel__autoplay-toggle';

			if ( ! existing ) {
				element.appendChild( toggle );
			}

			const autoplay = () => embla.plugins()?.autoplay ?? null;

			const sync = () => {
				const isPlaying = Boolean( autoplay()?.isPlaying() );

				toggle.dataset.state = isPlaying ? 'playing' : 'paused';
				toggle.setAttribute( 'aria-label', isPlaying ? 'Pause autoplay' : 'Play autoplay' );
			};

			toggle.addEventListener(
				'click',
				() => {
					const plugin = autoplay();

					if ( ! plugin ) {
						return;
					}

					if ( plugin.isPlaying() ) {
						plugin.stop();
					} else {
						plugin.play();
					}

					sync();
				},
				{ signal },
			);

			embla.on( 'autoplay:play', sync );
			embla.on( 'autoplay:stop', sync );
			sync();
		}

		const guardedNavigate = ( button, canNavigate, navigate ) => {
			button?.addEventListener(
				'click',
				() => {
					if ( canNavigate() ) {
						navigate();
					}
				},
				{ signal },
			);
		};

		guardedNavigate( prevBtn, () => embla.canScrollPrev(), () => embla.scrollPrev() );
		guardedNavigate( nextBtn, () => embla.canScrollNext(), () => embla.scrollNext() );

		element.addEventListener(
			'keydown',
			( event ) => {
				if ( 'ArrowRight' === event.key ) {
					event.preventDefault();
					embla.scrollNext();
				} else if ( 'ArrowLeft' === event.key ) {
					event.preventDefault();
					embla.scrollPrev();
				}
			},
			{ signal },
		);

		const onSelect = () => {
			syncArrows();
			syncDots();
		};

		// `slidesChanged` covers the editor's repeater: Embla watches the container with a
		// MutationObserver and re-inits itself, so we only have to rebuild what we own.
		const onStructureChange = () => {
			labelSlides();
			buildDots();
			syncArrows();
		};

		embla.on( 'select', onSelect );
		embla.on( 'reInit', onStructureChange );
		embla.on( 'slidesChanged', onStructureChange );

		labelSlides();
		buildDots();
		syncArrows();
		setupAutoplayToggle();

		return () => embla.destroy();
	},
} );

export { TYPE, msToEmblaDuration };
