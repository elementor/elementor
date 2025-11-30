( function( $ ) {
	'use strict';

	var AdminMenu = {
		init: function() {
			this.setupFlyoutMenus();
			this.setupMobileSupport();
		},

		setupFlyoutMenus: function() {
			var self = this;

			$( '#adminmenu li.elementor-has-flyout' ).each( function() {
				var $parentLi = $( this );
				var $flyoutMenu = $parentLi.children( '.elementor-submenu-flyout' );

				if ( ! $flyoutMenu.length ) {
					return;
				}

				$parentLi.on( 'mouseenter', function() {
					self.positionFlyout( $parentLi, $flyoutMenu );
					$flyoutMenu.addClass( 'elementor-submenu-flyout-visible' );
				} ).on( 'mouseleave', function() {
					$flyoutMenu.removeClass( 'elementor-submenu-flyout-visible' );
				} );

				$parentLi.children( 'a' ).on( 'focus', function() {
					self.positionFlyout( $parentLi, $flyoutMenu );
					$flyoutMenu.addClass( 'elementor-submenu-flyout-visible' );
				} );

				$flyoutMenu.on( 'focusout', function( e ) {
					if ( ! $parentLi.has( e.relatedTarget ).length ) {
						$flyoutMenu.removeClass( 'elementor-submenu-flyout-visible' );
					}
				} );

				self.setupKeyboardNavigation( $parentLi, $flyoutMenu );
			} );
		},

		positionFlyout: function( $parentLi, $flyoutMenu ) {
			var windowHeight = $( window ).height();
			var flyoutHeight = $flyoutMenu.outerHeight();
			var parentOffset = $parentLi.offset();
			var parentTop = parentOffset ? parentOffset.top : 0;
			var scrollTop = $( window ).scrollTop();
			var relativeTop = parentTop - scrollTop;

			if ( relativeTop + flyoutHeight > windowHeight ) {
				var newTop = windowHeight - flyoutHeight - relativeTop;
				if ( newTop < -relativeTop ) {
					newTop = -relativeTop + 10;
				}
				$flyoutMenu.css( 'top', newTop + 'px' );
			} else {
				$flyoutMenu.css( 'top', '0' );
			}
		},

		setupKeyboardNavigation: function( $parentLi, $flyoutMenu ) {
			$parentLi.on( 'keydown', function( e ) {
				var $focusedItem = $flyoutMenu.find( 'a:focus' );
				var $allItems = $flyoutMenu.find( 'a' );
				var currentIndex = $allItems.index( $focusedItem );

				switch ( e.key ) {
					case 'ArrowRight':
						if ( ! $flyoutMenu.hasClass( 'elementor-submenu-flyout-visible' ) ) {
							e.preventDefault();
							$flyoutMenu.addClass( 'elementor-submenu-flyout-visible' );
							$allItems.first().focus();
						}
						break;

					case 'ArrowLeft':
						if ( $flyoutMenu.hasClass( 'elementor-submenu-flyout-visible' ) ) {
							e.preventDefault();
							$flyoutMenu.removeClass( 'elementor-submenu-flyout-visible' );
							$parentLi.children( 'a' ).focus();
						}
						break;

					case 'ArrowDown':
						if ( $flyoutMenu.hasClass( 'elementor-submenu-flyout-visible' ) && currentIndex >= 0 ) {
							e.preventDefault();
							var nextIndex = ( currentIndex + 1 ) % $allItems.length;
							$allItems.eq( nextIndex ).focus();
						}
						break;

					case 'ArrowUp':
						if ( $flyoutMenu.hasClass( 'elementor-submenu-flyout-visible' ) && currentIndex >= 0 ) {
							e.preventDefault();
							var prevIndex = ( currentIndex - 1 + $allItems.length ) % $allItems.length;
							$allItems.eq( prevIndex ).focus();
						}
						break;

					case 'Escape':
						if ( $flyoutMenu.hasClass( 'elementor-submenu-flyout-visible' ) ) {
							e.preventDefault();
							$flyoutMenu.removeClass( 'elementor-submenu-flyout-visible' );
							$parentLi.children( 'a' ).focus();
						}
						break;
				}
			} );
		},

		setupMobileSupport: function() {
			if ( window.innerWidth > 782 ) {
				return;
			}

			$( '#adminmenu li.elementor-has-flyout > a' ).on( 'click', function( e ) {
				var $parentLi = $( this ).parent();
				var $flyoutMenu = $parentLi.children( '.elementor-submenu-flyout' );

				if ( $flyoutMenu.length ) {
					if ( $parentLi.hasClass( 'elementor-flyout-open' ) ) {
						return true;
					}

					e.preventDefault();
					$( '#adminmenu li.elementor-has-flyout' ).removeClass( 'elementor-flyout-open' );
					$parentLi.addClass( 'elementor-flyout-open' );
				}
			} );

			$( document ).on( 'click', function( e ) {
				if ( ! $( e.target ).closest( '#adminmenu li.elementor-has-flyout' ).length ) {
					$( '#adminmenu li.elementor-has-flyout' ).removeClass( 'elementor-flyout-open' );
				}
			} );
		},
	};

	$( document ).ready( function() {
		AdminMenu.init();
	} );
} )( jQuery );

