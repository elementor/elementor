import { dropElement } from '@elementor/editor-elements';

import { addCompositeWidgetToPage, canInsertCompositeWidgets } from '../add-composite-widget-to-page';
import { createDefinition } from './panel-definitions-fixture';

jest.mock( '@elementor/editor-elements', () => ( { dropElement: jest.fn() } ) );

const DEFINITION = createDefinition( 'site/card' );
const PREVIEW_ID = 'document';

const setEditor = ( selected: unknown[], userCan = true ) => {
	( window as never as Record< string, unknown > ).elementor = {
		selection: { getElements: () => selected },
		getPreviewContainer: () => ( { id: PREVIEW_ID } ),
		userCan: () => userCan,
	};
	( window as never as Record< string, unknown > ).elementorCommon = {
		eventsManager: { dispatchEvent: jest.fn() },
	};
};

const getTrack = () =>
	( window as never as { elementorCommon: { eventsManager: { dispatchEvent: jest.Mock } } } ).elementorCommon
		.eventsManager.dispatchEvent;

describe( 'addCompositeWidgetToPage', () => {
	beforeEach( () => jest.mocked( dropElement ).mockReset() );

	it( 'should insert into the document when nothing is selected', () => {
		// Arrange.
		setEditor( [] );

		// Act.
		addCompositeWidgetToPage( DEFINITION );

		// Assert.
		expect( dropElement ).toHaveBeenCalledWith(
			expect.objectContaining( {
				containerId: PREVIEW_ID,
				model: expect.objectContaining( {
					custom: expect.objectContaining( { compositeWidgetId: 'site/card' } ),
				} ),
			} )
		);
	} );

	it( 'should insert after a selected widget in its parent', () => {
		// Arrange.
		setEditor( [
			{
				id: 'w1',
				model: { get: () => 'widget' },
				parent: { id: 'box', model: { get: () => ( { findIndex: () => 2 } ) } },
			},
		] );

		// Act.
		addCompositeWidgetToPage( DEFINITION );

		// Assert.
		expect( dropElement ).toHaveBeenCalledWith(
			expect.objectContaining( { containerId: 'box', options: { at: 3, scrollIntoView: true } } )
		);
	} );

	it( 'should insert into a selected container', () => {
		// Arrange.
		setEditor( [ { id: 'box', model: { get: () => 'e-div-block' } } ] );

		// Act.
		addCompositeWidgetToPage( DEFINITION );

		// Assert.
		expect( dropElement ).toHaveBeenCalledWith( expect.objectContaining( { containerId: 'box' } ) );
	} );

	it( 'should not insert on multi-selection', () => {
		// Arrange.
		setEditor( [
			{ id: 'a', model: { get: () => 'widget' } },
			{ id: 'b', model: { get: () => 'widget' } },
		] );

		// Act.
		addCompositeWidgetToPage( DEFINITION );

		// Assert.
		expect( dropElement ).not.toHaveBeenCalled();
	} );

	it( 'should do nothing when the drop throws', () => {
		// Arrange.
		setEditor( [] );
		jest.mocked( dropElement ).mockImplementation( () => {
			throw new Error( 'Container not found' );
		} );

		// Act & Assert.
		expect( () => addCompositeWidgetToPage( DEFINITION ) ).not.toThrow();
		expect( getTrack() ).not.toHaveBeenCalled();
	} );

	it( 'should track the add only when the drop succeeds', () => {
		// Arrange.
		setEditor( [] );

		// Act.
		jest.mocked( dropElement ).mockReturnValueOnce( undefined as never );
		addCompositeWidgetToPage( DEFINITION );
		jest.mocked( dropElement ).mockReturnValueOnce( {} as never );
		addCompositeWidgetToPage( DEFINITION );

		// Assert.
		expect( getTrack() ).toHaveBeenCalledTimes( 1 );
		expect( getTrack() ).toHaveBeenCalledWith(
			'add_element',
			expect.objectContaining( { location: 'editor_panel' } )
		);
	} );
} );

describe( 'canInsertCompositeWidgets', () => {
	it( 'should allow inserting when the preview exists and the user can design', () => {
		// Arrange.
		setEditor( [] );

		// Act & Assert.
		expect( canInsertCompositeWidgets() ).toBe( true );
	} );

	it( 'should not allow inserting without the design capability', () => {
		// Arrange.
		setEditor( [], false );

		// Act & Assert.
		expect( canInsertCompositeWidgets() ).toBe( false );
	} );
} );
