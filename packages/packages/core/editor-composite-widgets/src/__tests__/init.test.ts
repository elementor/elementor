import { injectTab } from '@elementor/editor-elements-panel';

import { init } from '../init';
import { CompositeWidgetsTab } from '../panel/composite-widgets-tab';

jest.mock( '@elementor/editor-elements-panel', () => ( { injectTab: jest.fn() } ) );
jest.mock( '../closed-structure/structure-guards', () => ( { initStructureGuards: jest.fn() } ) );
jest.mock( '../general/init-widget-general', () => ( { initWidgetGeneral: jest.fn() } ) );
jest.mock( '../navigator/init-navigator-icon', () => ( { initNavigatorIcon: jest.fn() } ) );
jest.mock( '../navigator/init-navigator-title', () => ( { initNavigatorTitle: jest.fn() } ) );
jest.mock( '../style/init-widget-style', () => ( { initWidgetStyle: jest.fn() } ) );
jest.mock( '../sync/expand-widget-on-drop', () => ( { initExpandWidgetOnDrop: jest.fn() } ) );

describe( 'init', () => {
	it( 'should add the saved widgets tab to the elements panel', () => {
		// Act.
		init();

		// Assert.
		expect( injectTab ).toHaveBeenCalledWith(
			expect.objectContaining( { id: 'composite-widgets', component: CompositeWidgetsTab } )
		);
	} );
} );
