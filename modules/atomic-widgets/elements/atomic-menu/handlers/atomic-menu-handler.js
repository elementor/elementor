import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';
import { getItems, getToggle, getItemsId, resolveItemsId, getFirstFocusable } from './utils';

register( {
	elementType: 'e-menu',
	id: 'e-menu-handler',
	callback: ( { element } ) => {
		const menuId = element.dataset.id;

		Alpine.data( `eMenu${ menuId }`, () => ( {
			open: false,

			init() {
				const items = getItems( this.$el );

				if ( items && ! items.id ) {
					items.id = getItemsId( menuId );
				}
			},

			close( { restoreFocus = false } = {} ) {
				if ( ! this.open ) {
					return;
				}

				this.open = false;

				if ( restoreFocus ) {
					getToggle( this.$el )?.focus();
				}
			},

			root: {
				':data-e-open'() {
					return this.open ? 'true' : undefined;
				},
				'@keydown.escape.window'() {
					this.close( { restoreFocus: true } );
				},
				'@click.outside'() {
					if ( 'overlay' === this.$el.dataset.eCollapsedPosition ) {
						this.close();
					}
				},
			},

			toggle: {
				'@click'( event ) {
					this.open = ! this.open;

					const isKeyboardActivation = 0 === event?.detail;

					if ( this.open && isKeyboardActivation ) {
						this.$nextTick( () => getFirstFocusable( getItems( this.$root ) )?.focus() );
					}
				},
				':aria-expanded'() {
					return this.open ? 'true' : 'false';
				},
				':aria-controls'() {
					return resolveItemsId( this.$root, menuId );
				},
				':aria-label'() {
					if ( this.$el.dataset.eCustomLabel ) {
						return this.$el.getAttribute( 'aria-label' );
					}

					const { eLabelOpen, eLabelClose } = this.$el.dataset;

					return this.open ? eLabelClose : eLabelOpen;
				},
			},
		} ) );
	},
} );
