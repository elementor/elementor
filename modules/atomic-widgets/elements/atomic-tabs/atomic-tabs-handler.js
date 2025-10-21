import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';

register( {
	elementType: 'e-tabs',
	uniqueId: 'e-tabs-handler',
	callback: ( { element } ) => {
		window.Alpine = Alpine;

		Alpine.data( 'atomicTabs', () => ( {
			activeTab: element.getAttribute( 'data-active-tab' ),

			tab: {
				'@click'() {
					const tabId = this.$el.getAttribute( 'id' );
					this.activeTab = tabId;
				},
				':aria-selected'() {
					const tabId = this.$el.getAttribute( 'id' );
					return this.activeTab === tabId ? 'true' : 'false';
				},
				':tabindex'() {
					const tabId = this.$el.getAttribute( 'id' );
					return this.activeTab === tabId ? '0' : '-1';
				},
			},

			tabContent: {
				'x-show'() {
					const tabId = this.$el.getAttribute( 'data-tab-id' );
					return this.activeTab === tabId;
				},
			},
		} ) );

		Alpine.start();
	},
} );
