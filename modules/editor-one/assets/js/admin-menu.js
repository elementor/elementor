( function() {
	'use strict';

	const HOVER_INTENT_DELAY = 300;
	const TRIANGLE_TOLERANCE = 50;

	class AdminMenu {
		constructor() {
			this.activeMenu = null;
			this.activeParent = null;
			this.closeTimeout = null;
			this.lastMousePos = null;
			this.exitPoint = null;
			this.mouseMoveHandler = null;
			this.config = window.elementorAdminMenuConfig || {};
		}

		init() {
			this.buildFlyoutMenus();
			this.setupFlyoutMenus();
			this.setupMobileSupport();
		}

		buildFlyoutMenus() {
			const editorFlyout = this.config.editorFlyout;
			const level4Flyouts = this.config.level4Flyouts;

			if ( ! editorFlyout || ! editorFlyout.items || ! editorFlyout.items.length ) {
				return;
			}

			let elementorMenu = document.querySelector( '#adminmenu a[href="admin.php?page=elementor"]' );

			if ( ! elementorMenu ) {
				elementorMenu = document.querySelector( '#adminmenu .toplevel_page_elementor' );
			}

			if ( ! elementorMenu ) {
				return;
			}

			const menuItem = elementorMenu.closest( 'li.menu-top' );

			if ( ! menuItem ) {
				return;
			}

			const submenu = menuItem.querySelector( '.wp-submenu' );

			if ( ! submenu ) {
				return;
			}

			const editorItem = submenu.querySelector( 'a[href*="elementor-editor"]' );

			if ( ! editorItem ) {
				return;
			}

			const editorLi = editorItem.closest( 'li' );

			if ( ! editorLi ) {
				return;
			}

			editorLi.classList.add( 'elementor-has-flyout' );

			const editorFlyoutUl = document.createElement( 'ul' );
			editorFlyoutUl.className = 'elementor-submenu-flyout elementor-level-3';

			editorFlyout.items.forEach( ( item ) => {
				const li = document.createElement( 'li' );
				li.setAttribute( 'data-group-id', item.group_id || '' );

				const a = document.createElement( 'a' );
				a.href = item.url;
				a.textContent = item.label;

				if ( item.group_id && level4Flyouts && level4Flyouts[ item.group_id ] ) {
					li.classList.add( 'elementor-has-flyout' );

					const level4Ul = document.createElement( 'ul' );
					level4Ul.className = 'elementor-submenu-flyout elementor-level-4';

					level4Flyouts[ item.group_id ].items.forEach( ( subItem ) => {
						const subLi = document.createElement( 'li' );
						const subA = document.createElement( 'a' );
						subA.href = subItem.url;
						subA.textContent = subItem.label;
						subLi.appendChild( subA );
						level4Ul.appendChild( subLi );
					} );

					li.appendChild( a );
					li.appendChild( level4Ul );
				} else {
					li.appendChild( a );
				}

				editorFlyoutUl.appendChild( li );
			} );

			editorLi.appendChild( editorFlyoutUl );
		}

		setupFlyoutMenus() {
			const menuItems = document.querySelectorAll( '#adminmenu li.elementor-has-flyout' );

			menuItems.forEach( ( parentLi ) => {
				const flyoutMenu = parentLi.querySelector( '.elementor-submenu-flyout' );

				if ( ! flyoutMenu ) {
					return;
				}

				this.attachHoverEvents( parentLi, flyoutMenu );
				this.attachFocusEvents( parentLi, flyoutMenu );
				this.attachKeyboardEvents( parentLi, flyoutMenu );
			} );
		}

		attachHoverEvents( parentLi, flyoutMenu ) {
			parentLi.addEventListener( 'mouseenter', () => {
				this.clearCloseTimeout();
				this.showFlyout( parentLi, flyoutMenu );
			} );

			parentLi.addEventListener( 'mouseleave', ( event ) => {
				this.exitPoint = { x: event.clientX, y: event.clientY };
				this.scheduleClose( parentLi, flyoutMenu );
			} );

			flyoutMenu.addEventListener( 'mouseenter', () => {
				this.clearCloseTimeout();
				this.stopMouseTracking();
			} );

			flyoutMenu.addEventListener( 'mouseleave', ( event ) => {
				this.exitPoint = { x: event.clientX, y: event.clientY };
				this.scheduleClose( parentLi, flyoutMenu );
			} );
		}

		attachFocusEvents( parentLi, flyoutMenu ) {
			const parentLink = parentLi.querySelector( ':scope > a' );

			if ( parentLink ) {
				parentLink.addEventListener( 'focus', () => {
					this.showFlyout( parentLi, flyoutMenu );
				} );
			}

			flyoutMenu.addEventListener( 'focusout', ( event ) => {
				if ( ! parentLi.contains( event.relatedTarget ) ) {
					this.hideFlyout( flyoutMenu );
				}
			} );
		}

		attachKeyboardEvents( parentLi, flyoutMenu ) {
			parentLi.addEventListener( 'keydown', ( event ) => {
				this.handleKeyNavigation( event, parentLi, flyoutMenu );
			} );
		}

		showFlyout( parentLi, flyoutMenu ) {
			if ( this.activeMenu && this.activeMenu !== flyoutMenu ) {
				this.hideFlyout( this.activeMenu );
			}

			this.positionFlyout( parentLi, flyoutMenu );
			flyoutMenu.classList.add( 'elementor-submenu-flyout-visible' );
			this.activeMenu = flyoutMenu;
			this.activeParent = parentLi;
		}

		hideFlyout( flyoutMenu ) {
			flyoutMenu.classList.remove( 'elementor-submenu-flyout-visible' );

			if ( this.activeMenu === flyoutMenu ) {
				this.activeMenu = null;
				this.activeParent = null;
				this.stopMouseTracking();
			}
		}

		scheduleClose( parentLi, flyoutMenu ) {
			this.clearCloseTimeout();
			this.startMouseTracking( parentLi, flyoutMenu );

			this.closeTimeout = setTimeout( () => {
				this.checkAndClose( flyoutMenu );
			}, HOVER_INTENT_DELAY );
		}

		checkAndClose( flyoutMenu ) {
			if ( ! this.activeMenu ) {
				return;
			}

			if ( ! this.isCursorInSafeZone() ) {
				this.hideFlyout( flyoutMenu );
			} else {
				this.closeTimeout = setTimeout( () => {
					this.checkAndClose( flyoutMenu );
				}, HOVER_INTENT_DELAY );
			}
		}

		clearCloseTimeout() {
			if ( this.closeTimeout ) {
				clearTimeout( this.closeTimeout );
				this.closeTimeout = null;
			}
		}

		startMouseTracking() {
			this.stopMouseTracking();

			this.mouseMoveHandler = ( event ) => {
				this.lastMousePos = { x: event.clientX, y: event.clientY };
			};

			document.addEventListener( 'mousemove', this.mouseMoveHandler );
		}

		stopMouseTracking() {
			if ( this.mouseMoveHandler ) {
				document.removeEventListener( 'mousemove', this.mouseMoveHandler );
				this.mouseMoveHandler = null;
			}
			this.lastMousePos = null;
			this.exitPoint = null;
		}

		isCursorInSafeZone() {
			if ( ! this.lastMousePos || ! this.activeMenu || ! this.activeParent ) {
				return false;
			}

			const cursor = this.lastMousePos;
			const parentRect = this.activeParent.getBoundingClientRect();

			if ( this.isPointInRect( cursor, parentRect ) ) {
				return true;
			}

			const flyoutRect = this.activeMenu.getBoundingClientRect();

			if ( this.isPointInRect( cursor, flyoutRect ) ) {
				return true;
			}

			return this.isPointInTriangle( cursor, parentRect, flyoutRect );
		}

		isPointInRect( point, rect ) {
			return point.x >= rect.left &&
				point.x <= rect.right &&
				point.y >= rect.top &&
				point.y <= rect.bottom;
		}

		isPointInTriangle( cursor, parentRect, flyoutRect ) {
			const triangleApex = {
				x: parentRect.right,
				y: parentRect.top + ( parentRect.height / 2 ),
			};

			const flyoutTopLeft = {
				x: flyoutRect.left,
				y: flyoutRect.top - TRIANGLE_TOLERANCE,
			};

			const flyoutBottomLeft = {
				x: flyoutRect.left,
				y: flyoutRect.bottom + TRIANGLE_TOLERANCE,
			};

			return this.pointInTriangle(
				cursor,
				triangleApex,
				flyoutTopLeft,
				flyoutBottomLeft,
			);
		}

		pointInTriangle( p, v1, v2, v3 ) {
			const sign = ( p1, p2, p3 ) => {
				return ( ( p1.x - p3.x ) * ( p2.y - p3.y ) ) - ( ( p2.x - p3.x ) * ( p1.y - p3.y ) );
			};

			const d1 = sign( p, v1, v2 );
			const d2 = sign( p, v2, v3 );
			const d3 = sign( p, v3, v1 );

			const hasNeg = ( 0 > d1 ) || ( 0 > d2 ) || ( 0 > d3 );
			const hasPos = ( 0 < d1 ) || ( 0 < d2 ) || ( 0 < d3 );

			return ! ( hasNeg && hasPos );
		}

		positionFlyout( parentLi, flyoutMenu ) {
			const windowHeight = window.innerHeight;
			const flyoutHeight = flyoutMenu.offsetHeight;
			const parentRect = parentLi.getBoundingClientRect();
			const relativeTop = parentRect.top;

			if ( relativeTop + flyoutHeight > windowHeight ) {
				let newTop = windowHeight - flyoutHeight - relativeTop;

				if ( newTop < -relativeTop ) {
					newTop = -relativeTop + 10;
				}

				flyoutMenu.style.top = newTop + 'px';
			} else {
				flyoutMenu.style.top = '0';
			}
		}

		handleKeyNavigation( event, parentLi, flyoutMenu ) {
			const allLinks = flyoutMenu.querySelectorAll( 'a' );
			const focusedLink = flyoutMenu.querySelector( 'a:focus' );
			const currentIndex = Array.from( allLinks ).indexOf( focusedLink );
			const isVisible = flyoutMenu.classList.contains( 'elementor-submenu-flyout-visible' );

			switch ( event.key ) {
				case 'ArrowRight':
					if ( ! isVisible ) {
						event.preventDefault();
						this.showFlyout( parentLi, flyoutMenu );
						allLinks[ 0 ]?.focus();
					}
					break;

				case 'ArrowLeft':
					if ( isVisible ) {
						event.preventDefault();
						this.hideFlyout( flyoutMenu );
						parentLi.querySelector( ':scope > a' )?.focus();
					}
					break;

				case 'ArrowDown':
					if ( isVisible && currentIndex >= 0 ) {
						event.preventDefault();
						const nextIndex = ( currentIndex + 1 ) % allLinks.length;
						allLinks[ nextIndex ]?.focus();
					}
					break;

				case 'ArrowUp':
					if ( isVisible && currentIndex >= 0 ) {
						event.preventDefault();
						const prevIndex = ( currentIndex - 1 + allLinks.length ) % allLinks.length;
						allLinks[ prevIndex ]?.focus();
					}
					break;

				case 'Escape':
					if ( isVisible ) {
						event.preventDefault();
						this.hideFlyout( flyoutMenu );
						parentLi.querySelector( ':scope > a' )?.focus();
					}
					break;
			}
		}

		setupMobileSupport() {
			if ( window.innerWidth > 782 ) {
				return;
			}

			const menuLinks = document.querySelectorAll( '#adminmenu li.elementor-has-flyout > a' );

			menuLinks.forEach( ( link ) => {
				link.addEventListener( 'click', ( event ) => {
					this.handleMobileClick( event, link );
				} );
			} );

			document.addEventListener( 'click', ( event ) => {
				this.handleDocumentClick( event );
			} );
		}

		handleMobileClick( event, link ) {
			const parentLi = link.parentElement;
			const flyoutMenu = parentLi.querySelector( '.elementor-submenu-flyout' );

			if ( ! flyoutMenu ) {
				return;
			}

			if ( parentLi.classList.contains( 'elementor-flyout-open' ) ) {
				return;
			}

			event.preventDefault();

			document.querySelectorAll( '#adminmenu li.elementor-has-flyout' ).forEach( ( item ) => {
				item.classList.remove( 'elementor-flyout-open' );
			} );

			parentLi.classList.add( 'elementor-flyout-open' );
		}

		handleDocumentClick( event ) {
			if ( ! event.target.closest( '#adminmenu li.elementor-has-flyout' ) ) {
				document.querySelectorAll( '#adminmenu li.elementor-has-flyout' ).forEach( ( item ) => {
					item.classList.remove( 'elementor-flyout-open' );
				} );
			}
		}
	}

	const initAdminMenu = () => {
		const adminMenu = new AdminMenu();
		adminMenu.init();
	};

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', initAdminMenu );
	} else {
		initAdminMenu();
	}
} )();

