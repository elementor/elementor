import { getElementType } from '@elementor/editor-elements';

import {
	type ClipboardElement,
	findNonAtomicElements,
	findNonAtomicElementsInElement,
	hasNonAtomicElementsInTree,
	isElementAtomic,
} from '../prevent-non-atomic-nesting';

jest.mock( '@elementor/editor-documents', () => ( {
	getV1CurrentDocument: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	getAllDescendants: jest.fn(),
	getElementType: jest.fn(),
} ) );

jest.mock( '@elementor/editor-notifications', () => ( {
	notify: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	blockCommand: jest.fn(),
} ) );

const mockGetElementType = getElementType as jest.Mock;

function setupElementsCache( atomicElements: string[], nonAtomicElements: string[] ) {
	mockGetElementType.mockImplementation( ( type: string ) => {
		if ( atomicElements.includes( type ) ) {
			return { key: type, controls: [], propsSchema: {} };
		}

		return null;
	} );
}

describe( 'isElementAtomic', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return true for atomic widget', () => {
		// Arrange
		setupElementsCache( [ 'e-heading' ], [] );

		// Act
		const result = isElementAtomic( 'e-heading' );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should return true for atomic container', () => {
		// Arrange
		setupElementsCache( [ 'e-div-block', 'e-flexbox' ], [] );

		// Act
		const result = isElementAtomic( 'e-div-block' );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should return false for non-atomic widget', () => {
		// Arrange
		setupElementsCache( [], [ 'heading' ] );

		// Act
		const result = isElementAtomic( 'heading' );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false for non-atomic container', () => {
		// Arrange
		setupElementsCache( [], [ 'container' ] );

		// Act
		const result = isElementAtomic( 'container' );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false for unknown element', () => {
		// Arrange
		setupElementsCache( [], [] );

		// Act
		const result = isElementAtomic( 'unknown-element' );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false when getElementType returns null', () => {
		// Arrange
		mockGetElementType.mockReturnValue( null );

		// Act
		const result = isElementAtomic( 'e-heading' );

		// Assert
		expect( result ).toBe( false );
	} );
} );

describe( 'hasNonAtomicElementsInTree', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		setupElementsCache( [ 'e-heading', 'e-button', 'e-div-block' ], [ 'heading', 'button', 'image', 'container' ] );
	} );

	it( 'should return false for empty array', () => {
		// Arrange
		const elements: ClipboardElement[] = [];

		// Act
		const result = hasNonAtomicElementsInTree( elements );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false for atomic widgets only', () => {
		// Arrange
		const elements: ClipboardElement[] = [
			{ elType: 'widget', widgetType: 'e-heading' },
			{ elType: 'widget', widgetType: 'e-button' },
		];

		// Act
		const result = hasNonAtomicElementsInTree( elements );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false for atomic containers only', () => {
		// Arrange
		const elements: ClipboardElement[] = [ { elType: 'e-div-block' } ];

		// Act
		const result = hasNonAtomicElementsInTree( elements );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return true for non-atomic widget at top level', () => {
		// Arrange
		const elements: ClipboardElement[] = [ { elType: 'widget', widgetType: 'heading' } ];

		// Act
		const result = hasNonAtomicElementsInTree( elements );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should return true for non-atomic container at top level', () => {
		// Arrange
		const elements: ClipboardElement[] = [ { elType: 'container' } ];

		// Act
		const result = hasNonAtomicElementsInTree( elements );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should return true for non-atomic widget nested in container', () => {
		// Arrange
		const elements: ClipboardElement[] = [
			{
				elType: 'e-div-block',
				elements: [ { elType: 'widget', widgetType: 'heading' } ],
			},
		];

		// Act
		const result = hasNonAtomicElementsInTree( elements );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should return true for non-atomic widget deeply nested', () => {
		// Arrange
		const elements: ClipboardElement[] = [
			{
				elType: 'e-div-block',
				elements: [
					{
						elType: 'e-div-block',
						elements: [
							{
								elType: 'e-div-block',
								elements: [ { elType: 'widget', widgetType: 'image' } ],
							},
						],
					},
				],
			},
		];

		// Act
		const result = hasNonAtomicElementsInTree( elements );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should return false for atomic containers with atomic widgets', () => {
		// Arrange
		const elements: ClipboardElement[] = [
			{
				elType: 'e-div-block',
				elements: [ { elType: 'widget', widgetType: 'e-heading' } ],
			},
		];

		// Act
		const result = hasNonAtomicElementsInTree( elements );

		// Assert
		expect( result ).toBe( false );
	} );
} );

describe( 'findNonAtomicElements', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		setupElementsCache( [ 'e-heading', 'e-button', 'e-div-block' ], [ 'heading', 'button', 'image', 'container' ] );
	} );

	it( 'should return empty array for no non-atomic elements', () => {
		// Arrange
		const elements: ClipboardElement[] = [ { elType: 'widget', widgetType: 'e-heading' } ];

		// Act
		const result = findNonAtomicElements( elements );

		// Assert
		expect( result ).toEqual( [] );
	} );

	it( 'should return unique element types', () => {
		// Arrange
		const elements: ClipboardElement[] = [
			{ elType: 'widget', widgetType: 'heading' },
			{ elType: 'widget', widgetType: 'heading' },
			{ elType: 'widget', widgetType: 'heading' },
		];

		// Act
		const result = findNonAtomicElements( elements );

		// Assert
		expect( result ).toEqual( [ 'heading' ] );
	} );

	it( 'should find all different non-atomic element types including containers', () => {
		// Arrange
		const elements: ClipboardElement[] = [
			{ elType: 'widget', widgetType: 'heading' },
			{ elType: 'widget', widgetType: 'button' },
			{ elType: 'container' },
		];

		// Act
		const result = findNonAtomicElements( elements );

		// Assert
		expect( result ).toContain( 'heading' );
		expect( result ).toContain( 'button' );
		expect( result ).toContain( 'container' );
		expect( result ).toHaveLength( 3 );
	} );

	it( 'should find non-atomic elements in nested elements', () => {
		// Arrange
		const elements: ClipboardElement[] = [
			{
				elType: 'e-div-block',
				elements: [
					{ elType: 'widget', widgetType: 'heading' },
					{
						elType: 'e-div-block',
						elements: [ { elType: 'widget', widgetType: 'button' } ],
					},
				],
			},
		];

		// Act
		const result = findNonAtomicElements( elements );

		// Assert
		expect( result ).toContain( 'heading' );
		expect( result ).toContain( 'button' );
	} );
} );

describe( 'findNonAtomicElementsInElement', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		setupElementsCache( [ 'e-heading', 'e-button', 'e-div-block' ], [ 'heading', 'button', 'image', 'container' ] );
	} );

	it( 'should return non-atomic element type for single non-atomic widget', () => {
		// Arrange
		const element = { elType: 'widget', widgetType: 'heading' };

		// Act
		const result = findNonAtomicElementsInElement( element );

		// Assert
		expect( result ).toEqual( [ 'heading' ] );
	} );

	it( 'should return non-atomic container type', () => {
		// Arrange
		const element = { elType: 'container' };

		// Act
		const result = findNonAtomicElementsInElement( element );

		// Assert
		expect( result ).toEqual( [ 'container' ] );
	} );

	it( 'should return empty array for atomic widget', () => {
		// Arrange
		const element = { elType: 'widget', widgetType: 'e-heading' };

		// Act
		const result = findNonAtomicElementsInElement( element );

		// Assert
		expect( result ).toEqual( [] );
	} );

	it( 'should return empty array for atomic container', () => {
		// Arrange
		const element = { elType: 'e-div-block' };

		// Act
		const result = findNonAtomicElementsInElement( element );

		// Assert
		expect( result ).toEqual( [] );
	} );

	it( 'should find non-atomic elements in children', () => {
		// Arrange
		const element = {
			elType: 'e-div-block',
			elements: [
				{ elType: 'widget', widgetType: 'e-heading' },
				{ elType: 'widget', widgetType: 'heading' },
				{ elType: 'widget', widgetType: 'button' },
			],
		};

		// Act
		const result = findNonAtomicElementsInElement( element );

		// Assert
		expect( result ).toContain( 'heading' );
		expect( result ).toContain( 'button' );
		expect( result ).not.toContain( 'e-heading' );
	} );

	it( 'should return unique element types for duplicates', () => {
		// Arrange
		const element = {
			elType: 'e-div-block',
			elements: [
				{ elType: 'widget', widgetType: 'heading' },
				{ elType: 'widget', widgetType: 'heading' },
			],
		};

		// Act
		const result = findNonAtomicElementsInElement( element );

		// Assert
		expect( result ).toEqual( [ 'heading' ] );
	} );
} );
