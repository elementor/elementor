import { createMockBreakpointsTree, createMockStyleDefinitionWithVariants, createMockStylesProvider } from 'test-utils';
import { type BreakpointId } from '@elementor/editor-responsive';
import { type StyleDefinitionState } from '@elementor/editor-styles';
import { hasVariable } from '@elementor/editor-variables';

import { getProviderByStyleId } from '../../contexts/style-context';
import { createStylesInheritance } from '../create-styles-inheritance';

jest.mock( '@elementor/editor-responsive' );
jest.mock( '../../contexts/style-context' );
jest.mock( '@elementor/editor-variables', () => ( {
	...jest.requireActual( '@elementor/editor-variables' ),
	hasVariable: jest.fn(),
} ) );

const mockHasVariable = jest.mocked( hasVariable );

describe( 'buildInitialSnapshotFromStyles - Variables', () => {
	const desktopNormal = { breakpoint: 'desktop', state: null } as const;

	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( getProviderByStyleId ).mockReturnValue( createMockStylesProvider( { key: 'test' } ) );
	} );

	it( 'should filter out variable values when variable does not exist', () => {
		mockHasVariable.mockReturnValue( false );

		const styleWithNonExistentVariable = createMockStyleDefinitionWithVariants( {
			variants: [
				{
					meta: desktopNormal,
					props: {
						color: {
							$$type: 'global-color-variable',
							value: 'non-existent-var-id',
						},
					},
					custom_css: null,
				},
			],
		} );

		const { getSnapshot } = createStylesInheritance(
			[ styleWithNonExistentVariable ],
			createMockBreakpointsTree()
		);

		const snapshot = getSnapshot( {
			breakpoint: 'desktop' as BreakpointId,
			state: null as StyleDefinitionState,
		} );

		expect( snapshot ).toEqual( {} );
		expect( mockHasVariable ).toHaveBeenCalledWith( 'non-existent-var-id' );
	} );

	it( 'should keep variable values when variable exists', () => {
		mockHasVariable.mockReturnValue( true );

		const styleWithExistentVariable = createMockStyleDefinitionWithVariants( {
			variants: [
				{
					meta: desktopNormal,
					props: {
						color: {
							$$type: 'global-color-variable',
							value: 'existing-var-id',
						},
					},
					custom_css: null,
				},
			],
		} );

		const { getSnapshot } = createStylesInheritance( [ styleWithExistentVariable ], createMockBreakpointsTree() );

		const snapshot = getSnapshot( {
			breakpoint: 'desktop' as BreakpointId,
			state: null as StyleDefinitionState,
		} );

		expect( snapshot ).toBeDefined();
		expect( snapshot?.color ).toBeDefined();
		expect( snapshot?.color?.[ 0 ]?.value ).toEqual( {
			$$type: 'global-color-variable',
			value: 'existing-var-id',
		} );
		expect( mockHasVariable ).toHaveBeenCalledWith( 'existing-var-id' );
	} );

	it( 'should keep non-variable values regardless of hasVariable result', () => {
		mockHasVariable.mockReturnValue( false );

		const styleWithNonVariableValue = createMockStyleDefinitionWithVariants( {
			variants: [
				{
					meta: desktopNormal,
					props: {
						color: '#ff0000',
					},
					custom_css: null,
				},
			],
		} );

		const { getSnapshot } = createStylesInheritance( [ styleWithNonVariableValue ], createMockBreakpointsTree() );

		const snapshot = getSnapshot( {
			breakpoint: 'desktop' as BreakpointId,
			state: null as StyleDefinitionState,
		} );

		expect( snapshot ).toBeDefined();
		expect( snapshot?.color ).toBeDefined();
		expect( snapshot?.color?.[ 0 ]?.value ).toBe( '#ff0000' );
		expect( mockHasVariable ).not.toHaveBeenCalled();
	} );

	it( 'should handle multiple variable types correctly', () => {
		mockHasVariable.mockImplementation( ( key: string ) => {
			return key === 'existing-color-var' || key === 'existing-font-var';
		} );

		const styleWithMultipleVariables = createMockStyleDefinitionWithVariants( {
			variants: [
				{
					meta: desktopNormal,
					props: {
						color: {
							$$type: 'global-color-variable',
							value: 'existing-color-var',
						},
						'font-family': {
							$$type: 'global-font-variable',
							value: 'existing-font-var',
						},
						'font-size': {
							$$type: 'global-color-variable',
							value: 'non-existent-var',
						},
					},
					custom_css: null,
				},
			],
		} );

		const { getSnapshot } = createStylesInheritance( [ styleWithMultipleVariables ], createMockBreakpointsTree() );

		const snapshot = getSnapshot( {
			breakpoint: 'desktop' as BreakpointId,
			state: null as StyleDefinitionState,
		} );

		expect( snapshot ).toBeDefined();
		expect( snapshot?.color ).toBeDefined();
		expect( snapshot?.color?.[ 0 ]?.value ).toEqual( {
			$$type: 'global-color-variable',
			value: 'existing-color-var',
		} );
		expect( snapshot?.[ 'font-family' ] ).toBeDefined();
		expect( snapshot?.[ 'font-family' ]?.[ 0 ]?.value ).toEqual( {
			$$type: 'global-font-variable',
			value: 'existing-font-var',
		} );
		expect( snapshot?.[ 'font-size' ] ).toBeUndefined();
		expect( mockHasVariable ).toHaveBeenCalledWith( 'existing-color-var' );
		expect( mockHasVariable ).toHaveBeenCalledWith( 'existing-font-var' );
		expect( mockHasVariable ).toHaveBeenCalledWith( 'non-existent-var' );
	} );

	it( 'should filter variable values that include "variable" in $$type', () => {
		mockHasVariable.mockReturnValue( false );

		const styleWithVariableType = createMockStyleDefinitionWithVariants( {
			variants: [
				{
					meta: desktopNormal,
					props: {
						color: {
							$$type: 'global-custom-size-variable',
							value: 'non-existent-custom-var',
						},
					},
					custom_css: null,
				},
			],
		} );

		const { getSnapshot } = createStylesInheritance( [ styleWithVariableType ], createMockBreakpointsTree() );

		const snapshot = getSnapshot( {
			breakpoint: 'desktop' as BreakpointId,
			state: null as StyleDefinitionState,
		} );

		expect( snapshot ).toEqual( {} );
		expect( mockHasVariable ).toHaveBeenCalledWith( 'non-existent-custom-var' );
	} );

	it( 'should keep values that are not variable types even if they have similar structure', () => {
		mockHasVariable.mockReturnValue( false );

		const styleWithNonVariableType = createMockStyleDefinitionWithVariants( {
			variants: [
				{
					meta: desktopNormal,
					props: {
						color: {
							$$type: 'color',
							value: '#ff0000',
						},
					},
					custom_css: null,
				},
			],
		} );

		const { getSnapshot } = createStylesInheritance( [ styleWithNonVariableType ], createMockBreakpointsTree() );

		const snapshot = getSnapshot( {
			breakpoint: 'desktop' as BreakpointId,
			state: null as StyleDefinitionState,
		} );

		expect( snapshot ).toBeDefined();
		expect( snapshot?.color ).toBeDefined();
		expect( snapshot?.color?.[ 0 ]?.value ).toEqual( {
			$$type: 'color',
			value: '#ff0000',
		} );
		expect( mockHasVariable ).not.toHaveBeenCalled();
	} );

	it( 'should handle mixed variable and non-variable values in same style', () => {
		mockHasVariable.mockImplementation( ( key: string ) => key === 'existing-var' );

		const styleWithMixedValues = createMockStyleDefinitionWithVariants( {
			variants: [
				{
					meta: desktopNormal,
					props: {
						color: {
							$$type: 'global-color-variable',
							value: 'existing-var',
						},
						'font-size': '16px',
						'margin-top': {
							$$type: 'global-color-variable',
							value: 'non-existent-var',
						},
					},
					custom_css: null,
				},
			],
		} );

		const { getSnapshot } = createStylesInheritance( [ styleWithMixedValues ], createMockBreakpointsTree() );

		const snapshot = getSnapshot( {
			breakpoint: 'desktop' as BreakpointId,
			state: null as StyleDefinitionState,
		} );

		expect( snapshot ).toBeDefined();
		expect( snapshot?.color ).toBeDefined();
		expect( snapshot?.color?.[ 0 ]?.value ).toEqual( {
			$$type: 'global-color-variable',
			value: 'existing-var',
		} );
		expect( snapshot?.[ 'font-size' ] ).toBeDefined();
		expect( snapshot?.[ 'font-size' ]?.[ 0 ]?.value ).toBe( '16px' );
		expect( snapshot?.[ 'margin-top' ] ).toBeUndefined();
	} );

	it( 'should handle hasVariable errors gracefully', () => {
		mockHasVariable.mockImplementation( () => {
			throw new Error( 'Registry error' );
		} );

		const styleWithVariable = createMockStyleDefinitionWithVariants( {
			variants: [
				{
					meta: desktopNormal,
					props: {
						color: {
							$$type: 'global-color-variable',
							value: 'some-var',
						},
					},
					custom_css: null,
				},
			],
		} );

		const { getSnapshot } = createStylesInheritance( [ styleWithVariable ], createMockBreakpointsTree() );

		expect( () =>
			getSnapshot( {
				breakpoint: 'desktop' as BreakpointId,
				state: null as StyleDefinitionState,
			} )
		).toThrow( 'Registry error' );
	} );

	it( 'should handle hasVariable returning false for non-existent variables', () => {
		mockHasVariable.mockReturnValue( false );

		const styleWithVariable = createMockStyleDefinitionWithVariants( {
			variants: [
				{
					meta: desktopNormal,
					props: {
						color: {
							$$type: 'global-color-variable',
							value: 'non-existent-var',
						},
					},
					custom_css: null,
				},
			],
		} );

		const { getSnapshot } = createStylesInheritance( [ styleWithVariable ], createMockBreakpointsTree() );

		const snapshot = getSnapshot( {
			breakpoint: 'desktop' as BreakpointId,
			state: null as StyleDefinitionState,
		} );

		expect( snapshot ).toBeDefined();
		expect( snapshot ).toEqual( {} );
	} );
} );
