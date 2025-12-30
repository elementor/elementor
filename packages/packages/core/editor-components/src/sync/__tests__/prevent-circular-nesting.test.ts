import { __getState as getState } from '@elementor/store';

import { type ComponentsPathItem, SLICE_NAME } from '../../store/store';
import {
	type ClipboardElement,
	extractComponentIdsFromElements,
	wouldCreateCircularNesting,
} from '../commands/prevent-circular-nesting';

jest.mock( '@elementor/store', () => ( {
	...jest.requireActual( '@elementor/store' ),
	__getState: jest.fn(),
} ) );

const MOCK_CURRENT_COMPONENT_ID = 100;
const MOCK_PARENT_COMPONENT_ID = 200;
const MOCK_GRANDPARENT_COMPONENT_ID = 300;
const MOCK_UNRELATED_COMPONENT_ID = 999;

const mockGetState = getState as jest.Mock;

function setupStore( currentComponentId: number | null, path: ComponentsPathItem[] ) {
	mockGetState.mockReturnValue( {
		[ SLICE_NAME ]: {
			currentComponentId,
			path,
		},
	} );
}

describe( 'wouldCreateCircularNesting', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return false when componentIdToAdd is undefined', () => {
		// Arrange
		setupStore( MOCK_CURRENT_COMPONENT_ID, [] );

		// Act
		const result = wouldCreateCircularNesting( undefined );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false when not editing any component', () => {
		// Arrange
		setupStore( null, [] );

		// Act
		const result = wouldCreateCircularNesting( MOCK_UNRELATED_COMPONENT_ID );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return true when trying to add the same component being edited', () => {
		// Arrange
		setupStore( MOCK_CURRENT_COMPONENT_ID, [
			{ componentId: MOCK_CURRENT_COMPONENT_ID, instanceId: 'instance-1' },
		] );

		// Act
		const result = wouldCreateCircularNesting( MOCK_CURRENT_COMPONENT_ID );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should return true when trying to add a parent component from the editing path', () => {
		// Arrange
		setupStore( MOCK_CURRENT_COMPONENT_ID, [
			{ componentId: MOCK_GRANDPARENT_COMPONENT_ID, instanceId: 'instance-1' },
			{ componentId: MOCK_PARENT_COMPONENT_ID, instanceId: 'instance-2' },
			{ componentId: MOCK_CURRENT_COMPONENT_ID, instanceId: 'instance-3' },
		] );

		// Act
		const resultParent = wouldCreateCircularNesting( MOCK_PARENT_COMPONENT_ID );
		const resultGrandparent = wouldCreateCircularNesting( MOCK_GRANDPARENT_COMPONENT_ID );

		// Assert
		expect( resultParent ).toBe( true );
		expect( resultGrandparent ).toBe( true );
	} );

	it( 'should return false when adding an unrelated component', () => {
		// Arrange
		setupStore( MOCK_CURRENT_COMPONENT_ID, [
			{ componentId: MOCK_PARENT_COMPONENT_ID, instanceId: 'instance-1' },
			{ componentId: MOCK_CURRENT_COMPONENT_ID, instanceId: 'instance-2' },
		] );

		// Act
		const result = wouldCreateCircularNesting( MOCK_UNRELATED_COMPONENT_ID );

		// Assert
		expect( result ).toBe( false );
	} );
} );

describe( 'extractComponentIdsFromElements', () => {
	const COMPONENT_TYPE = 'e-component';

	function createComponentElement( componentId: number ): ClipboardElement {
		return {
			widgetType: COMPONENT_TYPE,
			settings: {
				component_instance: {
					$$type: 'component-instance',
					value: {
						component_id: {
							$$type: 'number',
							value: componentId,
						},
					},
				},
			},
		};
	}

	function createContainerElement( children: ClipboardElement[] ): ClipboardElement {
		return {
			widgetType: 'container',
			elements: children,
		};
	}

	it( 'should return empty array when no components exist', () => {
		// Arrange
		const elements: ClipboardElement[] = [ { widgetType: 'button' }, { widgetType: 'heading' } ];

		// Act
		const result = extractComponentIdsFromElements( elements );

		// Assert
		expect( result ).toEqual( [] );
	} );

	it( 'should extract component IDs from top-level elements', () => {
		// Arrange
		const elements: ClipboardElement[] = [ createComponentElement( 100 ), createComponentElement( 200 ) ];

		// Act
		const result = extractComponentIdsFromElements( elements );

		// Assert
		expect( result ).toEqual( [ 100, 200 ] );
	} );

	it( 'should extract component IDs from nested elements', () => {
		// Arrange
		const elements: ClipboardElement[] = [ createContainerElement( [ createComponentElement( 100 ) ] ) ];

		// Act
		const result = extractComponentIdsFromElements( elements );

		// Assert
		expect( result ).toEqual( [ 100 ] );
	} );

	it( 'should extract component IDs from deeply nested elements', () => {
		// Arrange
		const elements: ClipboardElement[] = [
			createContainerElement( [
				createContainerElement( [ createContainerElement( [ createComponentElement( 100 ) ] ) ] ),
			] ),
		];

		// Act
		const result = extractComponentIdsFromElements( elements );

		// Assert
		expect( result ).toEqual( [ 100 ] );
	} );

	it( 'should extract all component IDs from mixed nested structure', () => {
		// Arrange
		const elements: ClipboardElement[] = [
			createComponentElement( 100 ),
			createContainerElement( [
				{ widgetType: 'button' },
				createComponentElement( 200 ),
				createContainerElement( [ createComponentElement( 300 ) ] ),
			] ),
			createComponentElement( 400 ),
		];

		// Act
		const result = extractComponentIdsFromElements( elements );

		// Assert
		expect( result ).toEqual( [ 100, 200, 300, 400 ] );
	} );

	it( 'should handle elements without nested elements property', () => {
		// Arrange
		const elements: ClipboardElement[] = [ { widgetType: 'button' }, createComponentElement( 100 ) ];

		// Act
		const result = extractComponentIdsFromElements( elements );

		// Assert
		expect( result ).toEqual( [ 100 ] );
	} );
} );
