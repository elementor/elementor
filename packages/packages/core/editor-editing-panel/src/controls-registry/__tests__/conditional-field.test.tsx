import * as React from 'react';
import { createMockPropType } from 'test-utils';
import { PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import { type Dependency, type PropType, type PropValue } from '@elementor/editor-props';
import { render, screen } from '@testing-library/react';

import { useInheritedValues } from '../../contexts/styles-inheritance-context';
import { useStylesFields } from '../../hooks/use-styles-fields';
import { ConditionalField, getDependencies } from '../conditional-field';

jest.mock( '../../hooks/use-styles-fields' );
jest.mock( '../../contexts/styles-inheritance-context', () => ( {
	useInheritedValues: jest.fn().mockReturnValue( {} ),
} ) );

afterEach( () => jest.clearAllMocks() );

const createDependency = ( overrides: Partial< Dependency > = {} ): Dependency => ( {
	relation: 'and',
	terms: [],
	...overrides,
} );

const EXISTING_DEP = createDependency( {
	terms: [ { operator: 'exists', path: [ 'parent-field' ], value: null } ],
} );

const INHERITED_COVER: PropValue = { $$type: 'string', value: 'cover' };
const CHILD_VALUE: PropValue = { $$type: 'string', value: 'center' };

function mockDepField( values: Record< string, PropValue >, setValues = jest.fn() ) {
	jest.mocked( useStylesFields ).mockReturnValue( { values, setValues, canEdit: true } );
}

function mockInherited( values: Record< string, PropValue > ) {
	jest.mocked( useInheritedValues ).mockReturnValue( values );
}

function renderConditionalField( propType: PropType, childValue: PropValue = null, setValue = jest.fn() ) {
	const topLevelPropType = createMockPropType( {
		kind: 'object',
		shape: { child: propType },
	} );

	return render(
		<PropProvider value={ { child: childValue } } setValue={ setValue } propType={ topLevelPropType }>
			<PropKeyProvider bind="child">
				<ConditionalField>
					<span>visible</span>
				</ConditionalField>
			</PropKeyProvider>
		</PropProvider>
	);
}

function rerenderConditionalField(
	rerender: ReturnType< typeof render >[ 'rerender' ],
	propType: PropType,
	childValue: PropValue,
	setValue = jest.fn()
) {
	const topLevelPropType = createMockPropType( {
		kind: 'object',
		shape: { child: propType },
	} );

	rerender(
		<PropProvider value={ { child: childValue } } setValue={ setValue } propType={ topLevelPropType }>
			<PropKeyProvider bind="child">
				<ConditionalField>
					<span>visible</span>
				</ConditionalField>
			</PropKeyProvider>
		</PropProvider>
	);
}

describe( '<ConditionalField />', () => {
	beforeEach( () => {
		mockDepField( {} );
		mockInherited( {} );
	} );

	it( 'should render children when there are no dependencies', () => {
		const propType = createMockPropType( { kind: 'plain', key: 'string' } );

		renderConditionalField( propType );

		expect( screen.getByText( 'visible' ) ).toBeInTheDocument();
	} );

	it( 'should hide children when local dependency value does not satisfy "exists" operator', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			key: 'string',
			dependencies: EXISTING_DEP,
		} );

		mockDepField( { 'parent-field': null } );

		renderConditionalField( propType );

		expect( screen.queryByText( 'visible' ) ).not.toBeInTheDocument();
	} );

	it( 'should show children when inherited value satisfies "exists" operator (no local value)', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			key: 'string',
			dependencies: EXISTING_DEP,
		} );

		mockDepField( { 'parent-field': null } );
		mockInherited( { 'parent-field': INHERITED_COVER } );

		renderConditionalField( propType );

		expect( screen.getByText( 'visible' ) ).toBeInTheDocument();
	} );

	it( 'should prefer local value over inherited value', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			key: 'string',
			dependencies: createDependency( {
				terms: [ { operator: 'ne', path: [ 'parent-field' ], value: 'fill' } ],
			} ),
		} );

		mockDepField( { 'parent-field': { $$type: 'string', value: 'fill' } } );
		mockInherited( { 'parent-field': INHERITED_COVER } );

		renderConditionalField( propType );

		expect( screen.queryByText( 'visible' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'useSyncDepsWithInherited', () => {
	const mockSetValues = jest.fn();

	beforeEach( () => {
		mockInherited( {} );
	} );

	it( 'should write inherited value to dep field when field has a value and dep is empty', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			key: 'string',
			dependencies: EXISTING_DEP,
		} );

		mockDepField( { 'parent-field': null }, mockSetValues );
		mockInherited( { 'parent-field': INHERITED_COVER } );

		renderConditionalField( propType, CHILD_VALUE );

		expect( mockSetValues ).toHaveBeenCalledWith(
			{ 'parent-field': INHERITED_COVER },
			{ history: { propDisplayName: 'parent-field' } }
		);
	} );

	it( 'should not write to dep field when the field itself has no value', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			key: 'string',
			dependencies: EXISTING_DEP,
		} );

		mockDepField( { 'parent-field': null }, mockSetValues );
		mockInherited( { 'parent-field': INHERITED_COVER } );

		renderConditionalField( propType );

		expect( mockSetValues ).not.toHaveBeenCalled();
	} );

	it( 'should not overwrite dep field when it already has a value', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			key: 'string',
			dependencies: EXISTING_DEP,
		} );

		mockDepField( { 'parent-field': { $$type: 'string', value: 'fill' } }, mockSetValues );
		mockInherited( { 'parent-field': INHERITED_COVER } );

		renderConditionalField( propType, CHILD_VALUE );

		expect( mockSetValues ).not.toHaveBeenCalled();
	} );

	it( 'should not re-write dep after it was cleared by the user', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			key: 'string',
			dependencies: EXISTING_DEP,
		} );

		mockDepField( { 'parent-field': null }, mockSetValues );
		mockInherited( { 'parent-field': INHERITED_COVER } );

		const { rerender } = renderConditionalField( propType, CHILD_VALUE );

		expect( mockSetValues ).toHaveBeenCalledTimes( 1 );
		mockSetValues.mockClear();

		rerenderConditionalField( rerender, propType, CHILD_VALUE );

		expect( mockSetValues ).not.toHaveBeenCalled();
	} );

	it( 'should clear child value when a previously written dep is cleared', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			key: 'string',
			dependencies: EXISTING_DEP,
		} );

		const mockParentSetValue = jest.fn();

		mockDepField( { 'parent-field': null }, mockSetValues );
		mockInherited( { 'parent-field': INHERITED_COVER } );

		const { rerender } = renderConditionalField( propType, CHILD_VALUE, mockParentSetValue );

		expect( mockSetValues ).toHaveBeenCalledTimes( 1 );
		mockSetValues.mockClear();
		mockParentSetValue.mockClear();

		// Dep now has the written value (simulates provider update).
		mockDepField( { 'parent-field': INHERITED_COVER }, mockSetValues );
		rerenderConditionalField( rerender, propType, CHILD_VALUE, mockParentSetValue );

		expect( mockParentSetValue ).not.toHaveBeenCalled();

		// User clears the dep field.
		mockDepField( { 'parent-field': null }, mockSetValues );
		rerenderConditionalField( rerender, propType, CHILD_VALUE, mockParentSetValue );

		expect( mockParentSetValue ).toHaveBeenCalled();
	} );
} );

describe( 'getDependencies', () => {
	it( 'should return empty array when propType has no dependencies', () => {
		const propType = createMockPropType( { kind: 'plain' } );
		expect( getDependencies( propType ) ).toEqual( [] );
	} );

	it( 'should extract paths from dependency terms', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			dependencies: createDependency( {
				terms: [
					{ operator: 'exists', path: [ 'object-fit' ], value: null },
					{ operator: 'ne', path: [ 'object-fit' ], value: 'fill' },
				],
			} ),
		} );

		expect( getDependencies( propType ) ).toEqual( [ 'object-fit', 'object-fit' ] );
	} );
} );
