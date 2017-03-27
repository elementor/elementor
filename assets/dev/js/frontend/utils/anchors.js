var ViewModule = require( '../../utils/view-module' );

module.exports = ViewModule.extend( {
	getDefaultSettings: function() {

		return {
			scrollDuration: 1000,
			selectors: {
				links: 'a[href*="#"]',
				targets: '.elementor-element, .elementor-menu-anchor',
				scrollable: 'html, body',
				wpAdminBar: '#wpadminbar'
			}
		};
	},

	getDefaultElements: function() {
		var $ = jQuery,
			selectors = this.getSettings( 'selectors' );

		return {
			window: elementorFrontend.getScopeWindow(),
			$scrollable: $( selectors.scrollable ),
			$wpAdminBar: $( selectors.wpAdminBar )
		};
	},

	bindEvents: function() {
		elementorFrontend.getElements( '$document' ).on( 'click', this.getSettings( 'selectors.links' ), this.handleAnchorLinks );
	},

	handleAnchorLinks: function( event ) {
		var clickedLink = event.currentTarget,
			location = this.elements.window.location,
			isSamePathname = ( location.pathname === clickedLink.pathname ),
			isSameHostname = ( location.hostname === clickedLink.hostname );

		if ( ! isSameHostname || ! isSamePathname || clickedLink.hash.length < 2 ) {
			return;
		}

		var $anchor = jQuery( clickedLink.hash ).filter( this.getSettings( 'selectors.targets' ) );

		if ( ! $anchor.length ) {
			return;
		}

		var adminBarHeight = this.elements.$wpAdminBar.height(),
			scrollTop = $anchor.offset().top - adminBarHeight;

		event.preventDefault();

		scrollTop = elementorFrontend.hooks.applyFilters( 'frontend/handlers/menu_anchor/scroll_top_distance', scrollTop );

		this.elements.$scrollable.animate( {
			scrollTop: scrollTop
		}, this.getSettings( 'scrollDuration' ) );
	},

	onInit: function() {
		ViewModule.prototype.onInit.apply( this, arguments );

		this.bindEvents();
	}
} );
