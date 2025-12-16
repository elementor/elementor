import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';
import { TAB_ELEMENT_TYPE, TAB_CONTENT_ELEMENT_TYPE, getTabId, getTabContentId, getIndex, getNextTab } from './utils';

const SELECTED_CLASS = 'e--selected';

register( {
	elementType: 'e-tabs',
	id: 'e-tabs-handler',
	callback: ( { element, settings } ) => {
		const tabsId = element.dataset.id;

		Alpine.data( `eTabs${ tabsId }`, () => ( {
			activeTab: settings[ 'default-active-tab' ],

			navigateTabs( { key, target: tab } ) {
				const nextTab = getNextTab( key, tab );

				nextTab.focus();
			},
			tab: {
				':id'() {
					const index = getIndex( this.$el, TAB_ELEMENT_TYPE );

					return getTabId( tabsId, index );
				},
				'@click'() {
					const id = this.$el.id;

					this.activeTab = id;
				},
				'@keydown.arrow-right.prevent'( event ) {
					this.navigateTabs( event );
				},
				'@keydown.arrow-left.prevent'( event ) {
					this.navigateTabs( event );
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
					const index = getIndex( this.$el, TAB_ELEMENT_TYPE );

					return getTabContentId( tabsId, index );
				},
			},

			tabContent: {
				':aria-labelledby'() {
					const index = getIndex( this.$el, TAB_CONTENT_ELEMENT_TYPE );

					return getTabId( tabsId, index );
				},
				'x-show'() {
					const index = getIndex( this.$el, TAB_CONTENT_ELEMENT_TYPE );
					const tabId = getTabId( tabsId, index );

					const isActive = this.activeTab === tabId;

					this.$nextTick( () => {
						this.$el.classList.toggle( SELECTED_CLASS, isActive );
					} );

					return isActive;
				},
				':id'() {
					const index = getIndex( this.$el, TAB_CONTENT_ELEMENT_TYPE );

					return getTabContentId( tabsId, index );
				},
			},
		} ) );
	},
} );

