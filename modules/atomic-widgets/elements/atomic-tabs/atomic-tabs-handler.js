import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';

register( {
	elementType: 'e-tabs',
	uniqueId: 'e-tabs-handler',
	callback: ( { element, settings } ) => {
		const getTabId = ( tabIndex ) => {
			const tabsId = element.dataset.id;
			return `${ tabsId }-tab-${ tabIndex }`;
		};

		const getTabContentId = ( tabIndex ) => {
			const tabsId = element.dataset.id;
			return `${ tabsId }-tab-content-${ tabIndex }`;
		};

		Alpine.data( 'atomicTabs', () => ( {
			activeTab: settings[ 'default-active-tab' ],

			tab: {
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
					const tabIndex = this.$el.getAttribute( 'data-tab-index' );

					return getTabContentId( tabIndex );
				},
				':id'() {
					const tabIndex = this.$el.getAttribute( 'data-tab-index' );

					return getTabId( tabIndex );
				},
			},

			tabContent: {
				':aria-labelledby'() {
					const tabIndex = this.$el.getAttribute( 'data-tab-index' );

					return getTabId( tabIndex );
				},
				'x-show'() {
					const tabId = this.$el.getAttribute( 'aria-labelledby' );

					return this.activeTab === tabId;
				},
				':id'() {
					const tabIndex = this.$el.getAttribute( 'data-tab-index' );

					return getTabContentId( tabIndex );
				},
			},
		} ) );

		Alpine.initTree( element );
	},
} );
