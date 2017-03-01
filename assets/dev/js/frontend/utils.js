var Module = require( '../utils/module' );

module.exports = Module.extend( {
	getDefaultSettings: function() {
		return {
			YT: {
				isInserted: false,
				APISrc: 'https://www.youtube.com/iframe_api'
			},
			anchor: {
				scrollDuration: 1000,
				selectors: {
					links: 'a[href*="#"]',
					scrollable: 'html, body'
				}
			},
			selectors: {
				firstScript: 'script:first',
				wpAdminBar: '#wpadminbar'
			}
		};
	},

	getDefaultElements: function() {
		var $ = jQuery,
			selectors = this.getSettings( 'selectors' );

		return {
			window: elementorFrontend.getScopeWindow(),
			$firstScript: $( selectors.firstScript ),
			anchor: {
				$scrollable: $( this.getSettings( 'anchor.selectors.scrollable' ) )
			},
			$wpAdminBar: $( selectors.wpAdminBar )
		};
	},

	bindEvents: function() {
		elementorFrontend.getElements( '$document' ).on( 'click', this.getSettings( 'anchor.selectors.links' ), this.handleAnchorLinks );
	},

	insertYTAPI: function() {
		this.setSettings( 'YT.isInserted', true );

		this.elements.$firstScript.before( jQuery( '<script>', { src: this.getSettings( 'YT.APISrc' ) } ) );
	},

	onYoutubeApiReady: function( callback ) {
		var self = this;

		if ( ! self.getSettings( 'YT.IsInserted' ) ) {
			self.insertYTAPI();
		}

		if ( window.YT && YT.loaded ) {
			callback( YT );
		} else {
			// If not ready check again by timeout..
			setTimeout( function() {
				self.onYoutubeApiReady( callback );
			}, 350 );
		}
	},

	waypoint: function( $element, callback, options ) {
		var correctCallback = function() {
			var element = this.element || this;

			return callback.apply( element, arguments );
		};

		$element.elementorWaypoint( correctCallback, options );
	},

	handleAnchorLinks: function( event ) {
		var clickedLink = event.currentTarget,
			location = this.elements.window.location,
			isSamePathname = ( location.pathname === clickedLink.pathname ),
			isSameHostname = ( location.hostname === clickedLink.hostname );

		if ( ! isSameHostname || ! isSamePathname ) {
			return;
		}

		event.preventDefault();

		var $anchor = jQuery( clickedLink.hash ),
			adminBarHeight = this.elements.$wpAdminBar.height(),
			scrollTop = $anchor.offset().top - adminBarHeight;

		scrollTop = elementorFrontend.hooks.applyFilters( 'frontend/handlers/menu_anchor/scroll_top_distance', scrollTop );

		this.elements.anchor.$scrollable.animate( {
			scrollTop: scrollTop
		}, this.getSettings( 'anchor.scrollDuration' ) );
	},

	onInit: function() {
		this.bindEvents();
	}
} );
