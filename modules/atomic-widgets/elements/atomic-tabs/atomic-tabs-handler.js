import { register } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';

const TAB_ELEMENT_TYPE = 'e-tab';
const TAB_CONTENT_ELEMENT_TYPE = 'e-tab-content';

const SELECTED_CLASS = 'e--selected';
const NAVIGATE_UP_KEYS = [ 'ArrowUp', 'ArrowLeft' ];
const NAVIGATE_DOWN_KEYS = [ 'ArrowDown', 'ArrowRight' ];

register( {
	elementType: 'e-tabs',
	uniqueId: 'e-tabs-handler',
	callback: ( { element, settings } ) => {
		Alpine.data( 'atomicTabs', () => ( {
			activeTab: settings[ 'default-active-tab' ],

			navigateTabs( { key, target: tab } ) {
				const nextTab = getNextTab( key, tab );

				nextTab.focus();
			},
			tab: {
				':id'() {
					const index = getIndex( this.$el, TAB_ELEMENT_TYPE );

					return getTabId( index );
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
				'@keydown.arrow-down.prevent'( event ) {
					this.navigateTabs( event );
				},
				'@keydown.arrow-up.prevent'( event ) {
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

					return getTabContentId( index );
				},
			},

			tabContent: {
				':aria-labelledby'() {
					const index = getIndex( this.$el, TAB_CONTENT_ELEMENT_TYPE );

					return getTabId( index );
				},
				':class'() {
					const index = getIndex( this.$el, TAB_CONTENT_ELEMENT_TYPE );
					const tabId = getTabId( index );

					return this.activeTab === tabId ? SELECTED_CLASS : '';
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

		const getTabId = ( tabIndex ) => {
			const tabsId = element.dataset.id;
			return `${ tabsId }-tab-${ tabIndex }`;
		};

		const getTabContentId = ( tabIndex ) => {
			const tabsId = element.dataset.id;
			return `${ tabsId }-tab-content-${ tabIndex }`;
		};

		const getChildren = ( el, elementType ) => {
			const parent = el.parentElement;

			return Array.from( parent.children ).filter( ( child ) => {
				return child.dataset.element_type === elementType;
			} );
		};

		const getIndex = ( el, elementType ) => {
			const children = getChildren( el, elementType );

			return children.indexOf( el );
		};

		const getNextTab = ( key, tab ) => {
			const tabs = getChildren( tab, TAB_ELEMENT_TYPE );
			const tabsLength = tabs.length;

			const currentIndex = getIndex( tab, TAB_ELEMENT_TYPE );

			if ( NAVIGATE_DOWN_KEYS.includes( key ) ) {
				return tabs[ ( currentIndex + 1 ) % tabsLength ];
			}

			if ( NAVIGATE_UP_KEYS.includes( key ) ) {
				return tabs[ ( currentIndex - 1 + tabsLength ) % tabsLength ];
			}
		};
	},
} );

