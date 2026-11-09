import { isScrollSnapActive } from './utils';

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

		var anchorTop = $anchor.offset().top,
			scrollTop = anchorTop,
			$wpAdminBar = elementorFrontend.elements.$wpAdminBar,
			$activeStickies = jQuery( '.elementor-section.elementor-sticky--active:visible' ),
			maxStickyHeight = 0;

		if ( $wpAdminBar.length > 0 ) {
			scrollTop -= $wpAdminBar.height();
		}

		// Offset height of tallest sticky
		if ( $activeStickies.length > 0 ) {
			maxStickyHeight = Math.max.apply( null, $activeStickies.map( function() {
				return jQuery( this ).outerHeight();
			} ).get() );

			scrollTop -= maxStickyHeight;
		}

		event.preventDefault();

		scrollTop = elementorFrontend.hooks.applyFilters( 'frontend/handlers/menu_anchor/scroll_top_distance', scrollTop );

		// On scroll animation start: remove scroll-snap.
		if ( isScrollSnapActive() ) {
			elementorFrontend.elements.$body.css( 'scroll-snap-type', 'none' );
		}

		const restoreScrollSnap = () => {
			if ( isScrollSnapActive() ) {
				elementorFrontend.elements.$body.css( 'scroll-snap-type', '' );
			}
		};

		// `$scrollable` can hold both html and body, so the complete callback may run once per element.
		let isRealigned = false;

		this.elements.$scrollable.animate( {
			scrollTop,
		}, this.getSettings( 'scrollDuration' ), 'linear', () => {
			// Content above the anchor (lazy images, widgets) can resize while we animate toward the
			// position measured on click, so re-measure once and close the gap (ED-19404).
			if ( isRealigned ) {
				return;
			}

			const layoutShift = $anchor.offset().top - anchorTop;

			if ( Math.abs( layoutShift ) < 2 ) {
				restoreScrollSnap();
				return;
			}

			isRealigned = true;

			this.elements.$scrollable.animate( {
				scrollTop: scrollTop + layoutShift,
			}, this.getSettings( 'scrollDuration' ) / 2, 'linear', restoreScrollSnap );
		} );
	},

	onInit() {
		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );
	},
} );
