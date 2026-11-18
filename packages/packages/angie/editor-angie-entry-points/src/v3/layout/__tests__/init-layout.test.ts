jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateListenTo: jest.fn(),
	v1ReadyEvent: jest.fn( () => ( { type: 'v1-ready' } ) ),
} ) );

import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import {
	ANGIE_LAYOUT_FILTER_PRIORITY,
	applyAngieAddSectionBehavior,
	applyAngieTemplateLibraryBehaviors,
	filterLibraryActionButtonTemplate,
} from '../apply-angie-layout-entry-points';
import { initV3Layout } from '../init-layout';

describe( 'initV3Layout', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		delete ( window as { elementor?: unknown } ).elementor;
	} );

	it( 'registers layout hook overrides on v1 ready', () => {
		// Arrange
		const addFilter = jest.fn();
		( window as { elementor?: { hooks: { addFilter: typeof addFilter } } } ).elementor = {
			hooks: { addFilter },
		};

		// Act
		initV3Layout();

		// Assert
		expect( listenTo ).toHaveBeenCalledWith( v1ReadyEvent(), expect.any( Function ) );

		const readyCallback = jest.mocked( listenTo ).mock.calls[ 0 ][ 1 ];
		readyCallback( {
			type: 'window-event',
			event: 'elementor:init',
			originalEvent: new Event( 'elementor:init' ),
		} );

		expect( addFilter ).toHaveBeenCalledWith(
			'views/add-section/behaviors',
			applyAngieAddSectionBehavior,
			ANGIE_LAYOUT_FILTER_PRIORITY
		);
		expect( addFilter ).toHaveBeenCalledWith(
			'elements/container/contextMenuGroups',
			expect.any( Function ),
			ANGIE_LAYOUT_FILTER_PRIORITY
		);
		expect( addFilter ).toHaveBeenCalledWith(
			'elementor/editor/template-library/template/behaviors',
			applyAngieTemplateLibraryBehaviors,
			ANGIE_LAYOUT_FILTER_PRIORITY
		);
		expect( addFilter ).toHaveBeenCalledWith(
			'elementor/editor/template-library/template/action-button',
			filterLibraryActionButtonTemplate,
			11
		);
	} );
} );
