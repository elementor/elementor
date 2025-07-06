import { createMockElementType, createMockPropType, createMockStyleDefinition } from 'test-utils';
import { getStylesSchema } from '@elementor/editor-styles';

import { mockElement } from '../../__tests__/utils';
import { createMockSnapshotField } from '../../styles-inheritance/__tests__/mock-utils';
import { getInheritanceChainForPath, initStyleInheritanceMocks, mockElementStyles } from './styles-inheritance-utils';

jest.mock( '@elementor/editor-styles-repository' );
jest.mock( '../classes-prop-context' );
jest.mock( '@elementor/editor-responsive' );
jest.mock( '@elementor/editor-elements' );
jest.mock( '../style-context' );

describe( 'useStylesInheritanceChain', () => {
	beforeAll( () => {
		initStyleInheritanceMocks( 'style-id-1' );
	} );

	const element = mockElement();
	const elementType = createMockElementType();

	it( 'should provide a single styles inheritance field', () => {
		// Arrange.
		const mockStyleBasic1 = createMockStyleDefinition( {
			id: 'style-basic-1',
			props: {
				prop1: 1,
			},
		} );
		const mockStyleBasic2 = createMockStyleDefinition( {
			id: 'style-basic-2',
			props: {
				prop1: 2,
				prop2: 2,
			},
		} );

		mockElementStyles( [ mockStyleBasic1, mockStyleBasic2 ] );

		// Act.
		const { result: prop1Result } = getInheritanceChainForPath( element, elementType, [ 'prop1' ] );
		const { result: prop2Result } = getInheritanceChainForPath( element, elementType, [ 'prop2' ] );

		// Assert.
		expect( prop1Result.current ).toEqual( [
			createMockSnapshotField( mockStyleBasic1, { breakpoint: null, state: null }, [ 'prop1' ], null ),
			createMockSnapshotField( mockStyleBasic2, { breakpoint: null, state: null }, [ 'prop1' ], null ),
		] );

		expect( prop2Result.current ).toEqual( [
			createMockSnapshotField( mockStyleBasic2, { breakpoint: null, state: null }, [ 'prop2' ], null ),
		] );
	} );

	it( 'should retrieve the correct value from a nested object and filter out missing values', () => {
		// Arrange.
		const mockStyleObject1 = createMockStyleDefinition( {
			id: 'style-object-1',
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
		const mockStyleObject2 = createMockStyleDefinition( {
			id: 'style-object-2',
			props: {
				myObject: {
					$$type: 'some-object',
					value: {
						prop1: 'value3',
					},
				},
			},
		} );

		mockElementStyles( [ mockStyleObject1, mockStyleObject2 ] );

		// Act.
		const { result: prop1Result } = getInheritanceChainForPath( element, elementType, [ 'myObject', 'prop1' ] );
		const { result: prop2Result } = getInheritanceChainForPath( element, elementType, [ 'myObject', 'prop2' ] );

		// Assert.
		expect( prop1Result.current ).toEqual( [
			createMockSnapshotField(
				mockStyleObject1,
				{ breakpoint: null, state: null },
				[ 'myObject', 'prop1' ],
				null
			),
			createMockSnapshotField(
				mockStyleObject2,
				{ breakpoint: null, state: null },
				[ 'myObject', 'prop1' ],
				null
			),
		] );

		expect( prop2Result.current ).toEqual( [
			createMockSnapshotField(
				mockStyleObject1,
				{ breakpoint: null, state: null },
				[ 'myObject', 'prop2' ],
				null
			),
		] );
	} );

	it( 'should filter out missing values from nested unless the origin prop type is a union and the prop value is of another type', () => {
		// Arrange.
		const stringPropType = createMockPropType( {
			kind: 'plain',
			key: 'test-string',
		} );

		const objectPropType = createMockPropType( {
			kind: 'object',
			key: 'test-object',
			shape: {
				prop1: stringPropType,
				prop2: stringPropType,
			},
		} );

		const unionPropType = createMockPropType( {
			kind: 'union',
			prop_types: {
				object: objectPropType,
				string: stringPropType,
			},
		} );

		jest.mocked( getStylesSchema ).mockReturnValue( {
			unionProp: unionPropType,
		} );

		const styleWithAllNestedProps = createMockStyleDefinition( {
			id: 'style-with-all-nested-props',
			props: {
				unionProp: {
					$$type: 'test-object',
					value: {
						prop1: 'value1',
						prop2: 'value2',
					},
				},
			},
		} );

		const styleWithoutMatchingType = createMockStyleDefinition( {
			id: 'style-without-matching-prop-type',
			props: {
				unionProp: {
					$$type: 'test-string',
					value: 'value3',
				},
			},
		} );

		const styleWithSomeNestedProps = createMockStyleDefinition( {
			id: 'style-with-some-nested-props',
			props: {
				unionProp: {
					$$type: 'test-object',
					value: {
						prop1: 'value4',
					},
				},
			},
		} );

		mockElementStyles( [ styleWithAllNestedProps, styleWithoutMatchingType, styleWithSomeNestedProps ] );

		// Act.
		const { result: resultForProp1 } = getInheritanceChainForPath( element, elementType, [ 'unionProp', 'prop1' ] );
		const { result: resultForProp2 } = getInheritanceChainForPath( element, elementType, [ 'unionProp', 'prop2' ] );

		// Assert.
		expect( resultForProp1.current ).toEqual( [
			createMockSnapshotField(
				styleWithAllNestedProps,
				{ breakpoint: null, state: null },
				[ 'unionProp', 'prop1' ],
				null
			),
			createMockSnapshotField(
				styleWithoutMatchingType,
				{ breakpoint: null, state: null },
				[ 'unionProp' ],
				null
			),
			createMockSnapshotField(
				styleWithSomeNestedProps,
				{ breakpoint: null, state: null },
				[ 'unionProp', 'prop1' ],
				null
			),
		] );

		expect( resultForProp2.current ).toEqual( [
			createMockSnapshotField(
				styleWithAllNestedProps,
				{ breakpoint: null, state: null },
				[ 'unionProp', 'prop2' ],
				null
			),
			createMockSnapshotField(
				styleWithoutMatchingType,
				{ breakpoint: null, state: null },
				[ 'unionProp' ],
				null
			),
		] );
	} );
} );
