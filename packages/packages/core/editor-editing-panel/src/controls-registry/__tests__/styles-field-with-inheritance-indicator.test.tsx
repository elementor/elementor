import * as React from 'react';
import {
	createMockBreakpointsTree,
	createMockStyleDefinition,
	createMockStylesProvider,
	mockStylesSchema,
	renderWithTheme,
} from 'test-utils';
import { useElementSetting } from '@elementor/editor-elements';
import { getBreakpointsTree } from '@elementor/editor-responsive';
import { getStylesSchema, type StyleDefinitionVariant } from '@elementor/editor-styles';
import {
	ELEMENTS_BASE_STYLES_PROVIDER_KEY,
	ELEMENTS_STYLES_PROVIDER_KEY_PREFIX,
} from '@elementor/editor-styles-repository';
import { screen } from '@testing-library/react';

import { ControlLabel } from '../../components/control-label';
import { useStyle } from '../../contexts/style-context';
import { useStylesInheritanceChain } from '../../contexts/styles-inheritance-context';
import { useStylesFields } from '../../hooks/use-styles-fields';
import { StylesField } from '../styles-field';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-responsive' );
jest.mock( '@elementor/editor-styles' );
jest.mock( '@elementor/editor-styles-repository', () => ( {
	...jest.requireActual( '@elementor/editor-styles-repository' ),
	stylesRepository: {
		all: jest.fn(),
		subscribe: jest.fn(),
	},
} ) );

jest.mock( '../../hooks/use-styles-fields' );
jest.mock( '../../contexts/classes-prop-context' );
jest.mock( '../../contexts/style-context' );
jest.mock( '../../contexts/styles-inheritance-context' );

const desktopNormalMeta = {
	breakpoint: 'desktop',
	state: null,
} as StyleDefinitionVariant[ 'meta' ];

const mobileNormalMeta = {
	breakpoint: 'mobile',
	state: null,
} as StyleDefinitionVariant[ 'meta' ];

describe( 'StylesField with inheritance', () => {
	beforeEach( () => {
		jest.mocked( getStylesSchema ).mockReturnValue( mockStylesSchema );
		jest.mocked( useElementSetting ).mockReturnValue( {} );
		jest.mocked( getBreakpointsTree ).mockImplementation( createMockBreakpointsTree );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it.each( [
		{
			state: 'affecting',
			style: {
				id: 'style-id-1',
				meta: desktopNormalMeta,
				value: '5px',
			},
			stylesInheritance: [
				{
					style: createMockStyleDefinition( { id: 'style-id-1' } ),
					variant: createMockStyleVariant( desktopNormalMeta ),
					provider: null,
					value: '5px',
				},
				{
					style: createMockStyleDefinition( { id: 'style-id-2' } ),
					variant: createMockStyleVariant( desktopNormalMeta ),
					provider: null,
					value: '10px',
				},
			],
			expectedLabel: 'This is the final value',
		},
		{
			state: 'overridden',
			style: {
				id: 'style-id-2',
				meta: desktopNormalMeta,
				value: '10px',
			},
			stylesInheritance: [
				{
					style: createMockStyleDefinition( { id: 'style-id-1' } ),
					variant: createMockStyleVariant( desktopNormalMeta ),
					provider: null,
					value: '5px',
				},
				{
					style: createMockStyleDefinition( { id: 'style-id-2' } ),
					variant: createMockStyleVariant( desktopNormalMeta ),
					provider: null,
					value: '10px',
				},
			],
			expectedLabel: 'This value is overridden by another style',
		},
		{
			state: 'inherited value from another style def',
			style: {
				id: 'style-id-1',
				meta: desktopNormalMeta,
				value: null,
			},
			stylesInheritance: [
				{
					style: createMockStyleDefinition( { id: 'style-id-2' } ),
					variant: createMockStyleVariant( desktopNormalMeta ),
					provider: null,
					value: '10px',
				},
			],
			expectedLabel: 'This has value from another style',
		},
		{
			state: 'inherited value from another style variant of the same style def',
			style: {
				id: 'style-id-1',
				meta: mobileNormalMeta,
				value: null,
			},
			stylesInheritance: [
				{
					style: createMockStyleDefinition( { id: 'style-id-1' } ),
					variant: createMockStyleVariant( desktopNormalMeta ),
					provider: null,
					value: '10px',
				},
			],
			expectedLabel: 'This has value from another style',
		},
		{
			state: 'inherited value from the same style id but different breakpoint',
			style: {
				id: 'style-id-1',
				meta: mobileNormalMeta,
				value: null,
			},
			stylesInheritance: [
				{
					style: createMockStyleDefinition( { id: 'style-id-1' } ),
					variant: createMockStyleVariant( desktopNormalMeta ),
					provider: null,
					value: '10px',
				},
			],
			expectedLabel: 'This has value from another style',
		},
		{
			state: 'no value',
			style: {
				id: 'style-id-1',
				meta: desktopNormalMeta,
				value: null,
			},
			stylesInheritance: [],
			expectedLabel: null,
		},
		{
			state: 'inherited values only from base styles provider',
			style: {
				id: 'style-id-1',
				meta: desktopNormalMeta,
				value: null,
			},
			stylesInheritance: [
				{
					style: createMockStyleDefinition( { id: 'test-base-style' } ),
					variant: createMockStyleVariant( mobileNormalMeta ),
					provider: ELEMENTS_BASE_STYLES_PROVIDER_KEY,
					value: '5px',
				},
				{
					style: createMockStyleDefinition( { id: 'test-base-style' } ),
					variant: createMockStyleVariant( desktopNormalMeta ),
					provider: ELEMENTS_BASE_STYLES_PROVIDER_KEY,
					value: '10px',
				},
			],
			expectedLabel: null,
		},
	] )( 'should handle $state', ( { style, stylesInheritance, expectedLabel } ) => {
		// Arrange.
		jest.mocked( useStylesInheritanceChain ).mockReturnValue( stylesInheritance );
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'font-size': style.value },
			setValues: jest.fn(),
			canEdit: true,
		} );
		jest.mocked( useStyle ).mockReturnValue( {
			id: style.id,
			provider: createMockStylesProvider( { key: `${ ELEMENTS_STYLES_PROVIDER_KEY_PREFIX }1` } ),
			meta: style.meta,
			setMetaState: jest.fn(),
			setId: jest.fn(),
		} );

		// Act.
		const { container } = renderWithTheme(
			<StylesField bind="font-size" propDisplayName="Label">
				<ControlLabel>Label</ControlLabel>
			</StylesField>
		);

		// Assert.
		if ( expectedLabel !== null ) {
			expect( screen.getByText( 'Label' ) ).toBeInTheDocument();
			expect( screen.getByLabelText( expectedLabel ) ).toBeInTheDocument();

			expect( container.childNodes[ 0 ].childNodes.length ).toBe( 2 );
		} else {
			expect( screen.getByText( 'Label' ) ).toBeInTheDocument();

			expect( container.childNodes[ 0 ].childNodes.length ).toBe( 1 );
		}
	} );
} );

function createMockStyleVariant( meta: StyleDefinitionVariant[ 'meta' ] ) {
	return {
		props: {},
		meta,
		custom_css: null,
	};
}
