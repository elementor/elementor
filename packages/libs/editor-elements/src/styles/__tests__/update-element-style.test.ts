import { createMockElement } from 'test-utils';
import { createElementStyle, type V1ElementModelProps } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from '../../sync/get-container';
import { updateElementSettings, type UpdateElementSettingsArgs } from '../../sync/update-element-settings';
import { ELEMENT_STYLE_CHANGE_EVENT } from '../consts';
import { updateElementStyle } from '../update-element-style';

jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '../../sync/get-container' );
jest.mock( '../../sync/update-element-settings' );

describe( 'updateElementStyle', () => {
	it( 'should update a style, and notify its changes', () => {
		// Arrange.
		const existingStyle: StyleDefinition = {
			id: 'existing-style-id',
			label: 'Existing Style',
			type: 'class',
			variants: [
				{
					meta: { breakpoint: 'desktop', state: 'hover' },
					props: {
						existingProp: 'initial-value',
						propToRemove: 'value',
						anotherPropToRemove: 'value',
					},
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
		updateElementStyle( {
			elementId: 'test-element-id',
			styleId: existingStyle.id,
			meta: { breakpoint: 'desktop', state: 'hover' },
			props: {
				existingProp: 'updated-value',
				newProp: 'new-value',
				propToRemove: null,
				anotherPropToRemove: undefined,
			},
		} );

		// Assert.
		const updatedStyle = ( element.model.get( 'styles' ) ?? {} )[ existingStyle.id ];

		expect( updatedStyle.variants ).toStrictEqual( [
			{
				meta: { breakpoint: 'desktop', state: 'hover' },
				custom_css: null,
				props: {
					existingProp: 'updated-value',
					newProp: 'new-value',
				},
			},
		] );

		expect( listener ).toHaveBeenCalledTimes( 1 );
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/save/set-is-modified',
			{ status: true },
			{ internal: true }
		);
	} );

	it( 'should throw for non existing style', () => {
		// Arrange.
		const existingStyle: StyleDefinition = {
			id: 'existing-style-id',
			label: 'Existing Style',
			type: 'class',
			variants: [
				{
					meta: { breakpoint: null, state: null },
					props: { existingProp: 'initial-value' },
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

		// Act & Assert.
		expect( () => {
			updateElementStyle( {
				elementId: 'test-element-id',
				styleId: 'non-existing-style-id',
				meta: { breakpoint: null, state: null },
				props: {
					existingProp: 'updated-value',
				},
			} );
		} ).toThrow( 'Style not found.' );
	} );

	it( 'should throw for non existing element', () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( null );

		// Act & Assert.
		expect( () => {
			updateElementStyle( {
				elementId: 'test-element-id',
				styleId: 'existing-style-id',
				meta: { breakpoint: null, state: null },
				props: {
					existingProp: 'updated-value',
				},
			} );
		} ).toThrow( 'Element not found.' );
	} );

	it( 'should create a new variant if it does not exist', () => {
		// Arrange.
		const existingStyle: StyleDefinition = {
			id: 'existing-style-id',
			label: 'Existing Style',
			type: 'class',
			variants: [
				{
					meta: { breakpoint: 'desktop', state: 'hover' },
					props: { existingProp: 'initial-value' },
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

		// Act.
		updateElementStyle( {
			elementId: 'test-element-id',
			styleId: existingStyle.id,
			meta: { breakpoint: 'tablet', state: null },
			props: { newProp: 'new-value' },
		} );

		// Assert.
		const updatedStyle = ( element.model.get( 'styles' ) ?? {} )[ existingStyle.id ];

		expect( updatedStyle.variants ).toStrictEqual( [
			{
				meta: { breakpoint: 'desktop', state: 'hover' },
				props: { existingProp: 'initial-value' },
				custom_css: null,
			},
			{
				meta: { breakpoint: 'tablet', state: null },
				props: { newProp: 'new-value' },
				custom_css: null,
			},
		] );
	} );

	it( 'should remove empty variants', () => {
		// Arrange.
		const existingStyle: StyleDefinition = {
			id: 'existing-style-id',
			label: 'Existing Style',
			type: 'class',
			variants: [
				{
					meta: { breakpoint: null, state: null },
					props: { existingProp: 'initial-value' },
					custom_css: null,
				},
				{
					meta: { breakpoint: 'tablet', state: 'hover' },
					props: { existingProp: 'initial-value' },
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

		// Act.
		updateElementStyle( {
			elementId: 'test-element-id',
			styleId: existingStyle.id,
			meta: { breakpoint: null, state: null },
			props: { existingProp: null },
		} );

		// Assert.
		const updatedStyle = ( element.model.get( 'styles' ) ?? {} )[ existingStyle.id ];

		expect( updatedStyle.variants ).toStrictEqual( [
			{
				meta: { breakpoint: 'tablet', state: 'hover' },
				props: { existingProp: 'initial-value' },
				custom_css: null,
			},
		] );

		expect( updateElementSettings ).toHaveBeenCalledWith( {
			id: 'test-element-id',
			props: {
				classes: {
					$$type: 'classes',
					value: [ existingStyle.id ],
				},
			},
			withHistory: false,
		} );
	} );

	it( 'should remove empty styles', () => {
		// Arrange.
		const existingStyle1: StyleDefinition = {
			id: 'existing-style-id-1',
			label: 'Existing Style 1',
			type: 'class',
			variants: [
				{
					meta: { breakpoint: null, state: null },
					props: { existingProp: 'initial-value' },
					custom_css: null,
				},
			],
		};

		const existingStyle2: StyleDefinition = {
			id: 'existing-style-id-2',
			label: 'Existing Style 2',
			type: 'class',
			variants: [
				{
					meta: { breakpoint: null, state: null },
					props: { existingProp: 'initial-value' },
					custom_css: null,
				},
			],
		};

		const element = createMockElement( {
			model: {
				id: 'test-element-id',
				styles: {
					[ existingStyle1.id ]: existingStyle1,
					[ existingStyle2.id ]: existingStyle2,
				},
			},
			settings: {
				classes: {
					$$type: 'classes',
					value: [ existingStyle1.id, existingStyle2.id, 'external-style-id' ],
				},
			},
		} );

		jest.mocked( getContainer ).mockImplementation( ( elementId ) => {
			return elementId === 'test-element-id' ? element : null;
		} );

		// Act.
		updateElementStyle( {
			elementId: 'test-element-id',
			styleId: existingStyle1.id,
			meta: { breakpoint: null, state: null },
			props: { existingProp: null },
		} );

		// Assert.
		expect( updateElementSettings ).toHaveBeenCalledWith( {
			id: 'test-element-id',
			props: {
				classes: {
					$$type: 'classes',
					value: [ existingStyle2.id, 'external-style-id' ],
				},
			},
			withHistory: false,
		} );

		expect( element.model.get( 'styles' ) ).toStrictEqual( {
			[ existingStyle2.id ]: existingStyle2,
		} );
	} );

	it( 'should keep custom_css for valid CSS', () => {
		// Arrange.
		const element = createMockElement( {
			model: {
				id: 'test-element-id',
				styles: {},
			},
			settings: {},
		} );

		jest.mocked( getContainer ).mockImplementation( ( elementId ) => {
			return elementId === 'test-element-id' ? element : null;
		} );
		jest.mocked( updateElementSettings ).mockImplementation( ( { props }: UpdateElementSettingsArgs ) => {
			Object.keys( props ).forEach( ( key ) =>
				element.model.set( key as keyof V1ElementModelProps, props[ key ] as never )
			);
		} );

		const createdId = createElementStyle( {
			elementId: 'test-element-id',
			meta: { breakpoint: null, state: null },
			label: 'Test Style',
			classesProp: 'classes',
			props: {},
			custom_css: { raw: 'color: red;' },
		} );

		updateElementStyle( {
			elementId: 'test-element-id',
			styleId: createdId,
			meta: { breakpoint: null, state: null },
			props: {},
			custom_css: { raw: 'color: yellow;' },
		} );

		// Assert.
		expect( element.model.get( 'styles' ) ).toStrictEqual( {
			[ createdId ]: {
				id: createdId,
				label: 'Test Style',
				type: 'class',
				variants: [
					{
						custom_css: { raw: 'color: yellow;' },
						meta: { breakpoint: null, state: null },
						props: {},
					},
				],
			},
		} );
	} );
} );
