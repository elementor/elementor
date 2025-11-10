import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';

const SELECTED_CLASS = 'e--selected';
register( {
	elementType: 'e-tabs',
	id: 'e-tabs-handler',
	dependsOn: [ 'e-tabs-content-area', 'e-tabs-menu' ],
	callback: ( { element, settings } ) => {
		const TAB_ELEMENT_TYPE = 'e-tab';
		const TAB_CONTENT_ELEMENT_TYPE = 'e-tab-content';

		const getTabId = ( tabIndex ) => {
			const tabsId = element.dataset.id;
			return `${ tabsId }-tab-${ tabIndex }`;
		};

		const getTabContentId = ( tabIndex ) => {
			const tabsId = element.dataset.id;
			return `${ tabsId }-tab-content-${ tabIndex }`;
		};

		const getIndex = ( el, elementType ) => {
			const parent = el.parentElement;

			const children = Array.from( parent.children ).filter( ( child ) => {
				return child.dataset.element_type === elementType;
			} );

			return children.indexOf( el );
		};

		Alpine.data( 'atomicTabs', () => ( {
			activeTab: settings[ 'default-active-tab' ],

			tab: {
				':id'() {
					const index = getIndex( this.$el, TAB_ELEMENT_TYPE );

					return getTabId( index );
				},
				'@click'() {
					const id = this.$el.id;

					this.activeTab = id;
				},
				':class'() {
					const id = this.$el.id;

					return this.activeTab === id ? SELECTED_CLASS : '';
				},
				':aria-selected'() {
					const id = this.$el.id;

					return this.activeTab === id ? 'true' : 'false';
				},
				':tabindex'() {
					const id = this.$el.id;

					return this.activeTab === id ? '0' : '-1';
				},
				':aria-controls'() {
					const index = getIndex( this.$el, TAB_CONTENT_ELEMENT_TYPE );

					return getTabContentId( index );
				},
			},

			tabContent: {
				':aria-labelledby'() {
					const index = getIndex( this.$el, TAB_ELEMENT_TYPE );

					return getTabId( index );
				},
				'x-effect'() {
					const index = getIndex( this.$el, TAB_CONTENT_ELEMENT_TYPE );
					const tabId = getTabId( index );
					const isActive = this.activeTab === tabId;

					if ( isActive ) {
						this.$el.style.removeProperty( 'display' );
						this.$el.removeAttribute( 'hidden' );

						requestAnimationFrame( () => {
							this.$el.classList.add( SELECTED_CLASS );
						} );
					} else {
						this.$el.classList.remove( SELECTED_CLASS );
					}
				},
				'x-show'() {
					const index = getIndex( this.$el, TAB_CONTENT_ELEMENT_TYPE );
					const tabId = getTabId( index );

					return this.activeTab === tabId;
				},
				':id'() {
					const index = getIndex( this.$el, TAB_CONTENT_ELEMENT_TYPE );

					return getTabContentId( index );
				},
			},
		} ) );
	},
} );

