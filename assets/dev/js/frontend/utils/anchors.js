var ViewModule = require( '../../utils/view-module' );

module.exports = ViewModule.extend( {
	getDefaultSettings: function() {
		return {
			scrollDuration: 500,
			selectors: {
				links: 'a[href*="#"]',
				targets: '.elementor-element, .elementor-menu-anchor',
				scrollable: 'html, body'
			}
		};
	},

	getDefaultElements: function() {
		var $ = jQuery,
			selectors = this.getSettings( 'selectors' );

		return {
			$scrollable: $( selectors.scrollable )
		};
	},

	bindEvents: function() {
		elementorFrontend.getElements( '$document' ).on( 'click', this.getSettings( 'selectors.links' ), this.handleAnchorLinks );
	},

	handleAnchorLinks: function( event ) {
		var clickedLink = event.currentTarget,
			isSamePathname = ( location.pathname === clickedLink.pathname ),
			isSameHostname = ( location.hostname === clickedLink.hostname );

		if ( ! isSameHostname || ! isSamePathname || clickedLink.hash.length < 2 ) {
			return;
		}

		var $anchor = jQuery( clickedLink.hash ).filter( this.getSettings( 'selectors.targets' ) );

		if ( ! $anchor.length ) {
			return;
		}

		var scrollTop = $anchor.offset().top,
			$wpAdminBar = elementorFrontend.getElements( '$wpAdminBar' ),
			$activeStickys = jQuery( '.elementor-sticky--active' ),
			maxStickyHeight = 0;

		if ( $wpAdminBar.length > 0 ) {
			scrollTop -= $wpAdminBar.height();
		}

		// Offset height of tallest sticky
		if ( $activeStickys.length > 0 ) {
			 maxStickyHeight = Math.max.apply( null, $activeStickys.map( function() {
				return jQuery( this ).height();
			} ).get() );

			scrollTop -= maxStickyHeight;
		}

		event.preventDefault();

		scrollTop = elementorFrontend.hooks.applyFilters( 'frontend/handlers/menu_anchor/scroll_top_distance', scrollTop );

		this.elements.$scrollable.animate( {
			scrollTop: scrollTop
		}, this.getSettings( 'scrollDuration' ), 'linear' );
	},

	onInit: function() {
		ViewModule.prototype.onInit.apply( this, arguments );

		this.bindEvents();
	}
} );
