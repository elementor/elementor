import { mockLegacyElementor } from 'test-utils';
import { getWidgetsCache } from '@elementor/editor-elements';

import { initLegacyViews, registerElementType } from '../init-legacy-views';
import type { LegacyWindow } from '../types';

jest.mock( '@elementor/editor-elements', () => ( {
	getWidgetsCache: jest.fn(),
} ) );

jest.mock( '../../renderers/create-dom-renderer', () => ( {
	createDomRenderer: jest.fn( () => ( {
		register: jest.fn(),
		render: jest.fn(),
	} ) ),
} ) );

const MOCK_TYPE = 'test-loop-type';

const createMockAtomicWidget = () => ( {
	atomic: true,
	controls: {},
	title: MOCK_TYPE,
	twig_templates: {},
	twig_main_template: 'main',
	atomic_props_schema: {},
	base_styles_dictionary: {},
} );

describe( 'initLegacyViews', () => {
	beforeEach( () => {
		mockLegacyElementor();
	} );

	it( 'should register element type retroactively when called after v1Ready', async () => {
		// Arrange
		const mockElementsManager = {
			getElementTypeClass: jest.fn().mockReturnValue( null ),
			registerElementType: jest.fn(),
			elementTypes: {},
		};

		const legacyWindow = window as unknown as LegacyWindow;
		legacyWindow.elementor.elementsManager =
			mockElementsManager as unknown as LegacyWindow[ 'elementor' ][ 'elementsManager' ];

		jest.mocked( getWidgetsCache )
			.mockReturnValueOnce( {} )
			.mockReturnValue( { [ MOCK_TYPE ]: createMockAtomicWidget() } );

		initLegacyViews();
		await Promise.resolve();

		// Act — simulate late Pro registration after v1Ready has already fired
		const { createTemplatedElementType } = jest.requireActual( '../create-templated-element-type' );
		registerElementType( MOCK_TYPE, ( options ) => createTemplatedElementType( options ) );

		// Assert
		expect( mockElementsManager.registerElementType ).toHaveBeenCalledTimes( 1 );
		const [ registeredInstance ] = mockElementsManager.registerElementType.mock.calls[ 0 ];
		expect( registeredInstance.getType() ).toBe( MOCK_TYPE );
	} );
} );
