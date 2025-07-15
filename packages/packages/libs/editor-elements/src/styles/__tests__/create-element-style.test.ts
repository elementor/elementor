import { createMockElement } from 'test-utils';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from '../../sync/get-container';
import { updateElementSettings } from '../../sync/update-element-settings';
import { ELEMENT_STYLE_CHANGE_EVENT } from '../consts';
import { createElementStyle } from '../create-element-style';

jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '../../sync/get-container' );
jest.mock( '../../sync/update-element-settings' );

describe( 'createElementStyle', () => {
	it( 'should create a new style and add it to the element classes, and notify the changes', () => {
		// Arrange.
		const existingStyle: StyleDefinition = {
			id: 'existing-style-id',
			label: 'Existing Style',
			type: 'class',
			variants: [
				{
					meta: { breakpoint: null, state: null },
					props: { testProp: 'testValue' },
					custom_css: null,
				},
			],
		};

		const element = createMockElement( {
			model: {
				id: 'test-element-id',
				styles: {
					[ existingStyle.id ]: existingStyle,
				},
			},
			settings: {
				classes: {
					$$type: 'classes',
					value: [ existingStyle.id ],
				},
			},
		} );

		jest.mocked( getContainer ).mockImplementation( ( elementId ) => {
			return elementId === 'test-element-id' ? element : null;
		} );

		const listener = jest.fn();

		window.addEventListener( ELEMENT_STYLE_CHANGE_EVENT, listener );

		// Act.
		const createdId = createElementStyle( {
			elementId: 'test-element-id',
			meta: { breakpoint: null, state: null },
			label: 'Test Style',
			classesProp: 'classes',
			props: {
				testProp: 'testValue',
			},
		} );

		// Assert.
		expect( createdId ).toMatch( /^e-test-element-id-[a-z0-9]+$/ );

		expect( updateElementSettings ).toHaveBeenNthCalledWith( 1, {
			id: 'test-element-id',
			props: {
				classes: {
					$$type: 'classes',
					value: [ existingStyle.id, createdId ],
				},
			},
			withHistory: false,
		} );

		expect( element.model.get( 'styles' ) ).toStrictEqual( {
			[ existingStyle.id ]: existingStyle,

			[ createdId ]: {
				id: createdId,
				label: 'Test Style',
				type: 'class',
				variants: [
					{
						meta: { breakpoint: null, state: null },
						props: {
							testProp: 'testValue',
						},
						custom_css: null,
					},
				],
			},
		} );

		expect( listener ).toHaveBeenCalledTimes( 1 );
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/save/set-is-modified',
			{ status: true },
			{ internal: true }
		);
	} );

	it( 'should recreate a style with a user-passed id', () => {
		// Arrange.
		const element = createMockElement( {
			model: {
				widgetType: 'test-element',
				id: 'test-element-id',
				styles: {},
			},
			settings: {
				classes: {
					$$type: 'classes',
					value: [],
				},
			},
		} );

		jest.mocked( getContainer ).mockImplementation( ( elementId ) => {
			return elementId === 'test-element-id' ? element : null;
		} );

		// Act.
		createElementStyle( {
			styleId: 'test-id',
			elementId: 'test-element-id',
			meta: { breakpoint: null, state: null },
			label: 'Test Style',
			classesProp: 'classes',
			props: {
				testProp: 'testValue',
			},
		} );

		// Assert.
		const createdId = Object.keys( element.model.get( 'styles' ) ?? {} )[ 0 ];

		expect( createdId ).toBe( 'test-id' );
	} );

	it( 'should create a new classes prop if it does not exist', () => {
		// Arrange.
		const element = createMockElement( {
			model: {
				id: 'test-element-id',
				styles: {},
			},
			settings: {
				notClasses: 'no-classes-prop',
			},
		} );

		jest.mocked( getContainer ).mockImplementation( ( elementId ) => {
			return elementId === 'test-element-id' ? element : null;
		} );

		// Act.
		createElementStyle( {
			elementId: 'test-element-id',
			meta: { breakpoint: null, state: null },
			label: 'Test Style',
			classesProp: 'classes',
			props: {
				testProp: 'testValue',
			},
		} );

		// Assert.
		const createdId = Object.keys( element.model.get( 'styles' ) ?? {} )[ 0 ];

		expect( updateElementSettings ).toHaveBeenNthCalledWith( 1, {
			id: 'test-element-id',
			props: {
				classes: {
					$$type: 'classes',
					value: [ createdId ],
				},
			},
			withHistory: false,
		} );
	} );

	it( 'should throw for non existing element', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( null );

		// Act & Assert.
		expect( () => {
			createElementStyle( {
				elementId: 'test-element-id',
				meta: { breakpoint: null, state: null },
				label: 'Test Style',
				classesProp: 'classes',
				props: {
					testProp: 'testValue',
				},
			} );
		} ).toThrow( 'Element not found.' );
	} );
} );
