import { createMockElementType, createMockStyleDefinition } from 'test-utils';
import { useElementSetting } from '@elementor/editor-elements';
import { stylesRepository } from '@elementor/editor-styles-repository';

import { mockElement } from '../../__tests__/utils';
import { createMockSnapshotField } from '../../styles-inheritance/__tests__/mock-utils';
import { getInheritanceSnapshot, initStyleInheritanceMocks } from './styles-inheritance-utils';

jest.mock( '@elementor/editor-styles-repository' );
jest.mock( '../classes-prop-context' );
jest.mock( '@elementor/editor-responsive' );
jest.mock( '@elementor/editor-elements' );
jest.mock( '../style-context' );

const mockStyle1 = createMockStyleDefinition( {
	id: 'style-id-1',
	props: {
		prop1: 1,
	},
} );
const mockStyle2 = createMockStyleDefinition( {
	id: 'style-id-2',
	props: {
		prop1: 2,
		prop2: 2,
	},
} );
const mockStyle3 = createMockStyleDefinition( {
	id: 'style-id-3',
	props: {
		myObject: {
			$$type: 'some-object',
			value: {
				prop1: 'value1',
				prop2: 'value2',
			},
		},
	},
} );

describe( 'useStylesInheritanceSnapshot', () => {
	beforeAll( () => {
		initStyleInheritanceMocks( 'style-id-1' );
	} );

	beforeEach( () => {
		jest.mocked( stylesRepository.all ).mockReturnValue( [ mockStyle1, mockStyle2 ] );
	} );

	it.each( [
		{
			should: 'provide a snapshot of all applied styles',
			styles: [ mockStyle1, mockStyle2 ],
			snapshot: {
				prop1: [
					createMockSnapshotField( mockStyle1, { breakpoint: null, state: null }, [ 'prop1' ], null ),
					createMockSnapshotField( mockStyle2, { breakpoint: null, state: null }, [ 'prop1' ], null ),
				],
				prop2: [ createMockSnapshotField( mockStyle2, { breakpoint: null, state: null }, [ 'prop2' ], null ) ],
			},
		},
		{
			should: 'ignore non-existing style ids',
			styles: [ mockStyle3 ],
			snapshot: {},
		},
	] )( 'should $should', ( { styles, snapshot } ) => {
		// Arrange.
		const element = mockElement();
		const elementType = createMockElementType();

		jest.mocked( useElementSetting ).mockReturnValue( {
			$$type: 'classes',
			value: styles.map( ( { id } ) => id ),
		} );

		// Act.
		const { result } = getInheritanceSnapshot( element, elementType );

		// Assert.
		expect( result.current ).toEqual( snapshot );
	} );
} );
