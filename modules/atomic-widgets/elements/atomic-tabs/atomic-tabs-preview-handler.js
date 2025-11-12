import { Alpine } from '@elementor/alpinejs';

const editorElementor = window.parent?.elementor;

if ( editorElementor ) {
	editorElementor.hooks.addFilter( 'navigator/layout/behaviors', ( behaviors ) => {
		behaviors.atomicTabs = {
			behaviorClass: window.parent.Marionette.Behavior.extend( {
				ui: {
					items: '.elementor-navigator__item',
				},

				events: {
					'click @ui.items': 'onNavigatorItemClick',
				},

				onNavigatorItemClick( event ) {
					const TAB_ELEMENT_TYPE = 'e-tab';
					const TAB_CONTENT_ELEMENT_TYPE = 'e-tab-content';

					const item = event.currentTarget;
					const navigatorElement = item.closest( '.elementor-navigator__element' );
					const elementId = navigatorElement?.dataset.id;

					const container = editorElementor.getContainer( String( elementId ) );

					if ( ! container ) {
						return;
					}

					const elType = container.model.get( 'elType' );

					if ( elType !== TAB_CONTENT_ELEMENT_TYPE && elType !== TAB_ELEMENT_TYPE ) {
						return;
					}

					const id = container?.view?.$el[ 0 ]?.id;

					const parentContainer = container.parent;
					const grandparentContainer = parentContainer?.parent;
					const tabsElement = grandparentContainer?.view?.$el[ 0 ];

					const data = Alpine.$data( tabsElement );

					data.activeTab = id;
				},
			} ),
		};

		return behaviors;
	} );
}
