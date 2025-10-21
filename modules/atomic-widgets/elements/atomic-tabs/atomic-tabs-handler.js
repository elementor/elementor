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
					const tabIndex = this.$el.getAttribute( 'data-tab-index' );
					this.activeTab = tabIndex;
				},
				':aria-selected'() {
					const tabIndex = this.$el.getAttribute( 'data-tab-index' );
					return this.activeTab === tabIndex ? 'true' : 'false';
				},
				':tabindex'() {
					const tabIndex = this.$el.getAttribute( 'data-tab-index' );
					return this.activeTab === tabIndex ? '0' : '-1';
				},
				':aria-controls'() {
					const tabIndex = this.$el.getAttribute( 'data-tab-index' );
					return `atomic-tab-content-${ tabIndex }`;
				},
			},

			tabContent: {
				'x-show'() {
					const tabIndex = this.$el.getAttribute( 'data-tab-index' );
					return this.activeTab === tabIndex;
				},
				':aria-labelledby'() {
					const tabIndex = this.$el.getAttribute( 'data-tab-index' );
					return `atomic-tab-${ tabIndex }`;
				},
			},
		} ) );

		Alpine.start();
	},
} );
