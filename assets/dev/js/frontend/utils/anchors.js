import { isScrollSnapActive } from './utils';
import { ANCHOR_SCROLL_CORRECTION_THRESHOLD, settleAnchorScrollPosition } from './anchor-scroll-settle';

module.exports = elementorModules.ViewModule.extend( {
	getDefaultSettings() {
		return {
			scrollDuration: 500,
			selectors: {
				links: 'a[href*="#"]',
				targets: '.elementor-element, .elementor-menu-anchor',
				scrollable: isScrollSnapActive() ? 'body' : 'html, body',
			},
		};
	},

	getDefaultElements() {
		var $ = jQuery,
			selectors = this.getSettings( 'selectors' );

		return {
			$scrollable: $( selectors.scrollable ),
		};
	},

	bindEvents() {
		elementorFrontend.elements.$document.on( 'click', this.getSettings( 'selectors.links' ), this.handleAnchorLinks );
	},

	getScrollTopForAnchor( $anchor ) {
		var scrollTop = $anchor.offset().top,
			$wpAdminBar = elementorFrontend.elements.$wpAdminBar,
			$activeStickies = jQuery( '.elementor-section.elementor-sticky--active:visible' ),
			maxStickyHeight = 0;

		if ( $wpAdminBar.length > 0 ) {
			scrollTop -= $wpAdminBar.height();
		}

		if ( $activeStickies.length > 0 ) {
			maxStickyHeight = Math.max.apply( null, $activeStickies.map( function() {
				return jQuery( this ).outerHeight();
			} ).get() );

			scrollTop -= maxStickyHeight;
		}

		return elementorFrontend.hooks.applyFilters( 'frontend/handlers/menu_anchor/scroll_top_distance', scrollTop );
	},

	scrollToAnchor( $anchor ) {
		const $scrollable = this.elements.$scrollable;
		const getTargetScrollTop = () => this.getScrollTopForAnchor( $anchor );
		const applyScrollTop = ( scrollTop ) => {
			$scrollable.scrollTop( scrollTop );
		};
		const runSettlePass = () => {
			settleAnchorScrollPosition( {
				getTargetScrollTop,
				getCurrentScrollTop: () => $scrollable.scrollTop(),
				applyScrollTop,
			} );
		};

		const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
		const duration = prefersReducedMotion ? 0 : this.getSettings( 'scrollDuration' );

		if ( isScrollSnapActive() ) {
			elementorFrontend.elements.$body.css( 'scroll-snap-type', 'none' );
		}

		const onScrollComplete = () => {
			applyScrollTop( getTargetScrollTop() );
			runSettlePass();

			if ( isScrollSnapActive() ) {
				elementorFrontend.elements.$body.css( 'scroll-snap-type', '' );
			}
		};

		if ( ! duration ) {
			applyScrollTop( getTargetScrollTop() );
			onScrollComplete();
			return;
		}

		$scrollable
			.stop( true )
			.animate( { scrollTop: getTargetScrollTop() }, {
				duration,
				easing: 'linear',
				step( now, fx ) {
					const freshTarget = getTargetScrollTop();

					if ( Math.abs( freshTarget - fx.end ) > ANCHOR_SCROLL_CORRECTION_THRESHOLD ) {
						fx.end = freshTarget;
					}
				},
				complete: onScrollComplete,
			} );
	},

	handleAnchorLinks( event ) {
		var clickedLink = event.currentTarget,
			isSamePathname = ( location.pathname === clickedLink.pathname ),
			isSameHostname = ( location.hostname === clickedLink.hostname ),
			$anchor;

		if ( ! isSameHostname || ! isSamePathname || clickedLink.hash.length < 2 ) {
			return;
		}

		try {
			$anchor = jQuery( clickedLink.hash ).filter( this.getSettings( 'selectors.targets' ) );
		} catch ( e ) {
			return;
		}

		if ( ! $anchor.length ) {
			return;
		}

		event.preventDefault();

		this.scrollToAnchor( $anchor );
	},

	onInit() {
		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );
	},
} );
