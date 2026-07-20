import { getWidgetsCache } from '@elementor/editor-elements';

import { getLinkableWidgetTypes } from '../element-data-util';

jest.mock( '@elementor/editor-elements', () => ( {
	getWidgetsCache: jest.fn(),
} ) );

describe( 'getLinkableWidgetTypes', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns only widgets whose atomic schema exposes a link prop, sorted', () => {
		// Arrange
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'e-button': { atomic_props_schema: { text: {}, link: {} } },
			'e-heading': { atomic_props_schema: { title: {}, link: {} } },
			'e-divider': { atomic_props_schema: { color: {} } },
			'e-legacy': { controls: { some: {} } },
		} as never );

		// Act
		const result = getLinkableWidgetTypes();

		// Assert
		expect( result ).toEqual( [ 'e-button', 'e-heading' ] );
	} );

	it( 'excludes widgets opted out of LLM support even if they have a link prop', () => {
		// Arrange
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'e-button': { atomic_props_schema: { link: {} } },
			'e-hidden': { atomic_props_schema: { link: {} }, meta: { llm_support: false } },
		} as never );

		// Act
		const result = getLinkableWidgetTypes();

		// Assert
		expect( result ).toEqual( [ 'e-button' ] );
	} );

	it( 'returns an empty array when the widgets cache is empty', () => {
		// Arrange
		jest.mocked( getWidgetsCache ).mockReturnValue( undefined as never );

		// Act
		const result = getLinkableWidgetTypes();

		// Assert
		expect( result ).toEqual( [] );
	} );
} );
