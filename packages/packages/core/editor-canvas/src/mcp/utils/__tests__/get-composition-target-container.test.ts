import { type V1Element } from '@elementor/editor-elements';

import { getCompositionTargetContainer } from '../get-composition-target-container';

const createMockContainer = ( id: string, children?: V1Element[] ): V1Element =>
	( {
		id,
		model: { get: jest.fn(), set: jest.fn(), toJSON: jest.fn() },
		settings: { get: jest.fn(), set: jest.fn(), toJSON: jest.fn() },
		children,
	} ) as unknown as V1Element;

describe( 'getCompositionTargetContainer', () => {
	it( 'should return first child when document type is elementor_component', () => {
		// Arrange
		const firstChild = createMockContainer( 'child-1' );
		const documentContainer = createMockContainer( 'document', [ firstChild ] );

		// Act
		const result = getCompositionTargetContainer( documentContainer, 'elementor_component' );

		// Assert
		expect( result ).toBe( firstChild );
	} );

	it( 'should return document container when document type is not a component', () => {
		// Arrange
		const firstChild = createMockContainer( 'child-1' );
		const documentContainer = createMockContainer( 'document', [ firstChild ] );

		// Act
		const result = getCompositionTargetContainer( documentContainer, 'page' );

		// Assert
		expect( result ).toBe( documentContainer );
	} );

	it( 'should return document container when document type is undefined', () => {
		// Arrange
		const documentContainer = createMockContainer( 'document' );

		// Act
		const result = getCompositionTargetContainer( documentContainer, undefined );

		// Assert
		expect( result ).toBe( documentContainer );
	} );

	it( 'should return document container when component has no children', () => {
		// Arrange
		const documentContainer = createMockContainer( 'document' );

		// Act
		const result = getCompositionTargetContainer( documentContainer, 'elementor_component' );

		// Assert
		expect( result ).toBe( documentContainer );
	} );
} );
