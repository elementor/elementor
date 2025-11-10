import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';

register( {
	elementType: 'e-tabs',
	uniqueId: 'e-tabs-handler',
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

