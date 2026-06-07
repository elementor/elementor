import { mockLegacyElementor } from 'test-utils';
import { getWidgetsCache } from '@elementor/editor-elements';

import { createTemplatedElementType } from '../create-templated-element-type';
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

const createMockElementsManager = () => ( {
	getElementTypeClass: jest.fn().mockReturnValue( null ),
	registerElementType: jest.fn(),
	elementTypes: {} as Record< string, unknown >,
} );

const attachMockElementsManager = ( elementsManager: ReturnType< typeof createMockElementsManager > ) => {
	const legacyWindow = window as unknown as LegacyWindow;
	legacyWindow.elementor.elementsManager =
		elementsManager as unknown as LegacyWindow[ 'elementor' ][ 'elementsManager' ];
};

describe( 'initLegacyViews', () => {
	beforeEach( () => {
		mockLegacyElementor();
	} );

	it( 'should register a late element type via the legacy manager without leaking state', () => {
		// Arrange
		const elementsManager = createMockElementsManager();
		attachMockElementsManager( elementsManager );

		jest.mocked( getWidgetsCache ).mockReturnValue( { [ MOCK_TYPE ]: createMockAtomicWidget() } );

		initLegacyViews();
		elementsManager.registerElementType.mockClear();

		// Act
		registerElementType( MOCK_TYPE, ( options ) => createTemplatedElementType( options ) );

		// Assert
		expect( elementsManager.registerElementType ).toHaveBeenCalledTimes( 1 );
		const [ registeredInstance ] = elementsManager.registerElementType.mock.calls[ 0 ];
		expect( registeredInstance.getType() ).toBe( MOCK_TYPE );
	} );
} );
