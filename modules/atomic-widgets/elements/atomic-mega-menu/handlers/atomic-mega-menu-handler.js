import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';
import { ITEM_ELEMENT_TYPE, PANEL_ELEMENT_TYPE, getItemId, getPanelId, getIndex } from './utils';

const SELECTED_CLASS = 'e--selected';

register( {
	elementType: 'e-mega-menu',
	id: 'e-mega-menu-handler',
	callback: ( { element } ) => {
		const megaMenuId = element.dataset.id;

		Alpine.data( `eMegaMenu${ megaMenuId }`, () => ( {
			activeItem: null,

			menuItem: {
				':id'() {
					const index = getIndex( this.$el, ITEM_ELEMENT_TYPE );

					return getItemId( megaMenuId, index );
				},
				'@click'() {
					const id = this.$el.id;

					this.activeItem = this.activeItem === id ? null : id;
				},
				'@mouseenter'() {
					const id = this.$el.id;

					this.activeItem = id;
				},
				':class'() {
					const id = this.$el.id;

					return this.activeItem === id ? SELECTED_CLASS : '';
				},
				':aria-expanded'() {
					const id = this.$el.id;

					return this.activeItem === id ? 'true' : 'false';
				},
				':aria-controls'() {
					const index = getIndex( this.$el, ITEM_ELEMENT_TYPE );

					return getPanelId( megaMenuId, index );
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

					this.$nextTick( () => {
						this.$el.classList.toggle( SELECTED_CLASS, isActive );
					} );

					return isActive;
				},
				'@mouseleave'() {
					this.activeItem = null;
				},
			},
		} ) );
	},
} );
