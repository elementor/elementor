import * as React from 'react';
import { createMockPropType } from 'test-utils';
import { PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import type { Dependency, PropType } from '@elementor/editor-props';
import { render, screen } from '@testing-library/react';

import { useInheritedValues } from '../../contexts/styles-inheritance-context';
import { useStylesFields } from '../../hooks/use-styles-fields';
import { ConditionalField, getDependencies } from '../conditional-field';

jest.mock( '../../hooks/use-styles-fields' );
jest.mock( '../../contexts/styles-inheritance-context', () => ( {
	useInheritedValues: jest.fn().mockReturnValue( {} ),
} ) );

const createDependency = ( overrides: Partial< Dependency > = {} ): Dependency => ( {
	relation: 'and',
	terms: [],
	...overrides,
} );

function renderConditionalField( propType: PropType ) {
	const topLevelPropType = createMockPropType( {
		kind: 'object',
		shape: { child: propType },
	} );

	return render(
		<PropProvider value={ { child: null } } setValue={ jest.fn() } propType={ topLevelPropType }>
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
		jest.mocked( useStylesFields ).mockReturnValue( {
			values: {},
			setValues: jest.fn(),
			canEdit: true,
		} );
		jest.mocked( useInheritedValues ).mockReturnValue( {} );
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
			dependencies: createDependency( {
				terms: [ { operator: 'exists', path: [ 'parent-field' ], value: null } ],
			} ),
		} );

		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'parent-field': null },
			setValues: jest.fn(),
			canEdit: true,
		} );

		renderConditionalField( propType );

		expect( screen.queryByText( 'visible' ) ).not.toBeInTheDocument();
	} );

	it( 'should show children when local dependency value satisfies "exists" operator', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			key: 'string',
			dependencies: createDependency( {
				terms: [ { operator: 'exists', path: [ 'parent-field' ], value: null } ],
			} ),
		} );

		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'parent-field': { $$type: 'string', value: 'cover' } },
			setValues: jest.fn(),
			canEdit: true,
		} );

		renderConditionalField( propType );

		expect( screen.getByText( 'visible' ) ).toBeInTheDocument();
	} );

	it( 'should show children when inherited value satisfies "exists" operator (no local value)', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			key: 'string',
			dependencies: createDependency( {
				terms: [ { operator: 'exists', path: [ 'parent-field' ], value: null } ],
			} ),
		} );

		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'parent-field': null },
			setValues: jest.fn(),
			canEdit: true,
		} );

		jest.mocked( useInheritedValues ).mockReturnValue( {
			'parent-field': { $$type: 'string', value: 'cover' },
		} );

		renderConditionalField( propType );

		expect( screen.getByText( 'visible' ) ).toBeInTheDocument();
	} );

	it( 'should hide children when inherited value does not satisfy combined AND dependencies', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			key: 'string',
			dependencies: createDependency( {
				relation: 'and',
				terms: [
					{ operator: 'exists', path: [ 'parent-field' ], value: null },
					{ operator: 'ne', path: [ 'parent-field' ], value: 'fill' },
				],
			} ),
		} );

		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'parent-field': null },
			setValues: jest.fn(),
			canEdit: true,
		} );

		jest.mocked( useInheritedValues ).mockReturnValue( {
			'parent-field': { $$type: 'string', value: 'fill' },
		} );

		renderConditionalField( propType );

		expect( screen.queryByText( 'visible' ) ).not.toBeInTheDocument();
	} );

	it( 'should show children when inherited value satisfies combined AND dependencies (object-fit scenario)', () => {
		const propType = createMockPropType( {
			kind: 'plain',
			key: 'string',
			dependencies: createDependency( {
				relation: 'and',
				terms: [
					{ operator: 'exists', path: [ 'object-fit' ], value: null },
					{ operator: 'ne', path: [ 'object-fit' ], value: 'fill' },
				],
			} ),
		} );

		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'object-fit': null },
			setValues: jest.fn(),
			canEdit: true,
		} );

		jest.mocked( useInheritedValues ).mockReturnValue( {
			'object-fit': { $$type: 'string', value: 'cover' },
		} );

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

		jest.mocked( useStylesFields ).mockReturnValue( {
			values: { 'parent-field': { $$type: 'string', value: 'fill' } },
			setValues: jest.fn(),
			canEdit: true,
		} );

		jest.mocked( useInheritedValues ).mockReturnValue( {
			'parent-field': { $$type: 'string', value: 'cover' },
		} );

		renderConditionalField( propType );

		expect( screen.queryByText( 'visible' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'getDependencies', () => {
	it( 'should return empty array when propType has no dependencies', () => {
		const propType = createMockPropType( { kind: 'plain' } );
		expect( getDependencies( propType ) ).toEqual( [] );
	} );

	it( 'should return empty array when propType is undefined', () => {
		expect( getDependencies( undefined ) ).toEqual( [] );
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
