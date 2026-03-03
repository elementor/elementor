import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';
import {
	ITEM_ELEMENT_TYPE,
	PANEL_ELEMENT_TYPE,
	TOGGLE_ELEMENT_TYPE,
	SELECTED_CLASS,
	getItemId,
	getPanelId,
	getIndex,
	getItems,
	getPanels,
	isRtl,
} from './utils';

const HOVER_CLOSE_DELAY_MS = 150;
const DIAGONAL_TOLERANCE_PX = 50;

const BREAKPOINT_WIDTHS = {
	mobile: 767,
	tablet: 1024,
	none: 0,
};

function isDropdownMode( menuElement ) {
	const breakpoint = menuElement.dataset.breakpoint || 'tablet';

	if ( 'none' === breakpoint ) {
		return false;
	}

	const maxWidth = BREAKPOINT_WIDTHS[ breakpoint ] || BREAKPOINT_WIDTHS.tablet;

	return window.innerWidth <= maxWidth;
}

function positionPanel( panelEl, itemEl, menuElement, contentWidth, contentPosition ) {
	panelEl.style.left = '';
	panelEl.style.right = '';
	panelEl.style.bottom = '';
	panelEl.style.top = '';
	panelEl.style.width = '';

	if ( 'full-width' === contentWidth ) {
		panelEl.style.width = menuElement.offsetWidth + 'px';
		const navEl = itemEl.closest( '[data-element_type="e-mega-menu-nav"]' );

		if ( navEl ) {
			const navRect = navEl.getBoundingClientRect();
			const menuRect = menuElement.getBoundingClientRect();
			const rtl = isRtl();
			const prop = rtl ? 'right' : 'left';
			const offset = rtl ? navRect.right - menuRect.right : menuRect.left - navRect.left;
			panelEl.style[ prop ] = offset + 'px';
		}

		return;
	}

	const navEl = itemEl.closest( '[data-element_type="e-mega-menu-nav"]' );

	if ( ! navEl ) {
		return;
	}

	const itemRect = itemEl.getBoundingClientRect();
	const panelRect = panelEl.getBoundingClientRect();
	const bodyWidth = document.documentElement.clientWidth;
	const rtl = isRtl();
	const navRect = navEl.getBoundingClientRect();

	let offset = rtl
		? bodyWidth - itemRect.right
		: itemRect.left;

	const position = contentPosition || 'start';

	if ( 'center' === position ) {
		offset = rtl
			? bodyWidth - ( itemRect.left + ( itemRect.width / 2 ) + ( panelRect.width / 2 ) )
			: ( itemRect.left + ( itemRect.width / 2 ) ) - ( panelRect.width / 2 );
	} else if ( 'end' === position ) {
		offset = rtl
			? bodyWidth - itemRect.left
			: itemRect.right - panelRect.width;
	}

	if ( offset + panelRect.width > bodyWidth ) {
		offset = bodyWidth - panelRect.width;
	}

	if ( offset < 0 ) {
		offset = 0;
	}

	const prop = rtl ? 'right' : 'left';
	const navOffset = rtl ? bodyWidth - navRect.right : navRect.left;

	panelEl.style[ prop ] = `${ offset - navOffset }px`;

	const spaceBelow = window.innerHeight - navRect.bottom;

	if ( panelRect.height > spaceBelow && panelRect.height < navRect.top ) {
		panelEl.style.bottom = `${ navRect.height }px`;
		panelEl.style.top = 'auto';
	}
}

function getItemForPanel( menuElement, megaMenuId, panelEl ) {
	const panelIndex = getIndex( panelEl, PANEL_ELEMENT_TYPE );
	const itemId = getItemId( megaMenuId, panelIndex );

	return menuElement.querySelector( `#${ CSS.escape( itemId ) }` );
}

function isCursorBetweenItemAndPanel( event, itemEl, panelEl ) {
	if ( ! itemEl || ! panelEl ) {
		return false;
	}

	const itemRect = itemEl.getBoundingClientRect();
	const panelRect = panelEl.getBoundingClientRect();
	const mouseY = event.clientY;
	const mouseX = event.clientX;

	const isBelowItem = mouseY >= itemRect.bottom - DIAGONAL_TOLERANCE_PX;
	const isAbovePanel = mouseY <= panelRect.top + DIAGONAL_TOLERANCE_PX;
	const isWithinHorizontalBounds =
		mouseX >= Math.min( itemRect.left, panelRect.left ) - DIAGONAL_TOLERANCE_PX &&
		mouseX <= Math.max( itemRect.right, panelRect.right ) + DIAGONAL_TOLERANCE_PX;

	return isBelowItem && isAbovePanel && isWithinHorizontalBounds;
}

register( {
	elementType: 'e-mega-menu',
	id: 'e-mega-menu-handler',
	callback: ( { element, settings, signal } ) => {
		const triggerMode = settings?.[ 'trigger-mode' ];

		// Always use tablet breakpoint for responsive behavior
		element.setAttribute( 'data-breakpoint', 'tablet' );

		const megaMenuId = element.dataset.id;
		let closeTimeout = null;

		const clearCloseTimeout = () => {
			if ( closeTimeout ) {
				clearTimeout( closeTimeout );
				closeTimeout = null;
			}
		};

		const scheduleClose = ( context ) => {
			clearCloseTimeout();
			closeTimeout = setTimeout( () => {
				context.activeItem = null;
			}, HOVER_CLOSE_DELAY_MS );
		};

		const handleOutsideClick = ( event ) => {
			if ( element.contains( event.target ) ) {
				return;
			}

			const data = Alpine.$data( element );

			if ( data?.activeItem ) {
				data.activeItem = null;
			}

			if ( data?.menuOpen ) {
				data.menuOpen = false;
			}
		};

		document.addEventListener( 'click', handleOutsideClick );

		signal.addEventListener( 'abort', () => {
			document.removeEventListener( 'click', handleOutsideClick );
			clearCloseTimeout();
		} );

		Alpine.data( `eMegaMenu${ megaMenuId }`, () => ( {
			activeItem: null,
			menuOpen: false,
			isDropdown: isDropdownMode( element ),

			nav: {
				'x-show'() {
					return ! this.isDropdown || this.menuOpen;
				},

				':style'() {
					if ( this.isDropdown ) {
						return { 'flex-direction': 'column' };
					}

					return { 'flex-direction': '' };
				},
			},

			contentArea: {
				'x-show'() {
					return ! this.isDropdown || this.menuOpen;
				},
			},

			toggle: {
				'x-show'() {
					return this.isDropdown;
				},

				'@click'() {
					this.menuOpen = ! this.menuOpen;

					if ( ! this.menuOpen ) {
						this.activeItem = null;
					}
				},

				':aria-expanded'() {
					return this.menuOpen ? 'true' : 'false';
				},
			},

			menuItem: {
				':id'() {
					const index = getIndex( this.$el, ITEM_ELEMENT_TYPE );
					return getItemId( megaMenuId, index );
				},

				'@click'() {
					clearCloseTimeout();
					const id = this.$el.id;
					this.activeItem = this.activeItem === id ? null : id;
				},

				'@mouseenter'() {
					if ( 'click' === triggerMode ) {
						return;
					}

					if ( this.isDropdown ) {
						return;
					}

					clearCloseTimeout();
					this.activeItem = this.$el.id;
				},

				'@mouseleave'( event ) {
					if ( 'click' === triggerMode ) {
						return;
					}

					if ( this.isDropdown ) {
						return;
					}

					const items = getItems( element );
					const itemIndex = items.indexOf( this.$el );
					const panels = getPanels( element );
					const panelEl = panels[ itemIndex ];

					if ( panelEl && isCursorBetweenItemAndPanel( event, this.$el, panelEl ) ) {
						return;
					}

					scheduleClose( this );
				},

				':class'() {
					return this.activeItem === this.$el.id ? SELECTED_CLASS : '';
				},

				':aria-expanded'() {
					return this.activeItem === this.$el.id ? 'true' : 'false';
				},

				':aria-controls'() {
					const index = getIndex( this.$el, ITEM_ELEMENT_TYPE );
					return getPanelId( megaMenuId, index );
				},

				'@keydown'( event ) {
					const items = getItems( element );
					const currentIndex = items.indexOf( this.$el );
					const dropdown = this.isDropdown;

					let prevKey;
					let nextKey;

					if ( dropdown ) {
						prevKey = 'ArrowUp';
						nextKey = 'ArrowDown';
					} else {
						prevKey = isRtl() ? 'ArrowRight' : 'ArrowLeft';
						nextKey = isRtl() ? 'ArrowLeft' : 'ArrowRight';
					}

					const openKey = dropdown ? null : 'ArrowDown';

					switch ( event.key ) {
						case nextKey: {
							event.preventDefault();
							const nextIndex = ( currentIndex + 1 ) % items.length;
							items[ nextIndex ].focus();
							break;
						}

						case prevKey: {
							event.preventDefault();
							const prevIndex = ( currentIndex - 1 + items.length ) % items.length;
							items[ prevIndex ].focus();
							break;
						}

						case 'Home': {
							event.preventDefault();
							items[ 0 ]?.focus();
							break;
						}

						case 'End': {
							event.preventDefault();
							items[ items.length - 1 ]?.focus();
							break;
						}

						case 'Enter':
						case ' ': {
							event.preventDefault();
							const id = this.$el.id;
							this.activeItem = this.activeItem === id ? null : id;
							break;
						}

						case 'Escape': {
							event.preventDefault();

							if ( dropdown ) {
								if ( this.activeItem ) {
									this.activeItem = null;
									this.$el.trigger( 'focus' );
								} else {
									const toggleEl = element.querySelector(
										`[data-element_type="${ TOGGLE_ELEMENT_TYPE }"]`,
									);
									this.menuOpen = false;
									toggleEl?.focus();
								}
							} else {
								this.activeItem = null;
								this.$el.trigger( 'focus' );
							}
							break;
						}

						case 'Tab': {
							if ( this.activeItem !== this.$el.id ) {
								break;
							}

							const panels = getPanels( element );
							const panelEl = panels[ currentIndex ];

							if ( ! panelEl || event.shiftKey ) {
								break;
							}

							const focusable = panelEl.querySelector(
								'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
							);

							if ( focusable ) {
								event.preventDefault();
								focusable.focus();
							}
							break;
						}
					}

					if ( openKey && event.key === openKey && openKey !== nextKey ) {
						event.preventDefault();
						const id = this.$el.id;
						this.activeItem = id;

						this.$nextTick( () => {
							const panels = getPanels( element );
							const panelEl = panels[ currentIndex ];

							if ( ! panelEl ) {
								return;
							}

							const focusable = panelEl.querySelector(
								'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
							);

							focusable?.focus();
						} );
					}
				},

				':tabindex'() {
					const items = getItems( element );
					const isFirst = items[ 0 ] === this.$el;
					const isActive = this.activeItem === this.$el.id;

					return ( isFirst || isActive ) ? '0' : '-1';
				},

				':role'() {
					return 'menuitem';
				},
			},

			panel: {
				':id'() {
					const index = getIndex( this.$el, PANEL_ELEMENT_TYPE );
					return getPanelId( megaMenuId, index );
				},

				':aria-labelledby'() {
					const index = getIndex( this.$el, PANEL_ELEMENT_TYPE );
					return getItemId( megaMenuId, index );
				},

				'x-show'() {
					const index = getIndex( this.$el, PANEL_ELEMENT_TYPE );
					const itemId = getItemId( megaMenuId, index );
					const isActive = this.activeItem === itemId;
					const dropdown = this.isDropdown;

					this.$nextTick( () => {
						this.$el.classList.toggle( SELECTED_CLASS, isActive );

						if ( dropdown ) {
							this.$el.style.position = 'relative';
							this.$el.style.left = '';
							this.$el.style.right = '';
							this.$el.style.bottom = '';
							this.$el.style.top = '';
							return;
						}

						this.$el.style.position = '';

						if ( isActive ) {
							const itemEl = getItemForPanel( element, megaMenuId, this.$el );

							if ( itemEl ) {
								positionPanel( this.$el, itemEl, element, 'full-width', 'center' );
							}
						}
					} );

					return isActive;
				},

				'@mouseenter'() {
					if ( 'click' === triggerMode ) {
						return;
					}

					if ( this.isDropdown ) {
						return;
					}

					clearCloseTimeout();
				},

				'@mouseleave'() {
					if ( 'click' === triggerMode ) {
						return;
					}

					if ( this.isDropdown ) {
						return;
					}

					scheduleClose( this );
				},

				'@keydown.escape'() {
					const itemEl = getItemForPanel( element, megaMenuId, this.$el );
					this.activeItem = null;
					itemEl?.focus();
				},

				':role'() {
					return 'menu';
				},
			},
		} ) );

		const updateLayout = () => {
			const dropdown = isDropdownMode( element );
			element.setAttribute( 'data-layout', dropdown ? 'dropdown' : 'horizontal' );

			try {
				const data = Alpine.$data( element );

				if ( data ) {
					data.isDropdown = dropdown;
					data.activeItem = null;
					data.menuOpen = false;
				}
			} catch ( e ) {
				// Alpine may not have processed the element yet
			}
		};

		requestAnimationFrame( () => {
			updateLayout();
		} );

		window.addEventListener( 'resize', updateLayout );

		signal.addEventListener( 'abort', () => {
			window.removeEventListener( 'resize', updateLayout );
		} );
	},
} );
