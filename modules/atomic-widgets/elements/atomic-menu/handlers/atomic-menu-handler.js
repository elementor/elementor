import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';
import { getItems, getToggle, getItemsId } from './utils';

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
				'@click'() {
					this.open = ! this.open;
				},
				':aria-expanded'() {
					return this.open ? 'true' : 'false';
				},
				':aria-controls'() {
					return getItemsId( menuId );
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
