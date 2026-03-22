import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';
import { TAB_ELEMENT_TYPE, TAB_CONTENT_ELEMENT_TYPE, getTabId, getTabContentId, getIndex, getNextTab } from './utils';
import { getActiveTabId, setActiveTabId } from './editor-tabs-selection';

const SELECTED_CLASS = 'e--selected';

register( {
	elementType: 'e-tabs',
	id: 'e-tabs-handler',
	callback: ( { element, settings } ) => {
		const tabsId = element.dataset.id;
		const defaultActiveTab = settings[ 'default-active-tab' ];

		Alpine.data( `eTabs${ tabsId }`, () => ( {
			get activeTab() {
				return getActiveTabId( tabsId, defaultActiveTab );
			},

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
					setActiveTabId( tabsId, this.$el.id );
				},
				'@keydown.arrow-right.prevent'( event ) {
					this.navigateTabs( event );
				},
				'@keydown.arrow-left.prevent'( event ) {
					this.navigateTabs( event );
				},
				':class'() {
					const id = this.$el.id;

					return { [ SELECTED_CLASS ]: this.activeTab === id };
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

