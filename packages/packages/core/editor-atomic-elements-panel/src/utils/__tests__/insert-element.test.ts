import { dropElement } from '@elementor/editor-elements';

import { canInsertElements, insertElement } from '../insert-element';

jest.mock( '@elementor/editor-elements', () => ( { dropElement: jest.fn() } ) );

const tile = { elType: 'widget', widgetType: 'e-heading', title: 'Heading' };
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

describe( 'insertElement', () => {
	beforeEach( () => jest.mocked( dropElement ).mockReset() );

	it( 'should insert into the document when nothing is selected', () => {
		// Arrange.
		setEditor( [] );

		// Act.
		insertElement( tile );

		// Assert.
		expect( dropElement ).toHaveBeenCalledWith( expect.objectContaining( { containerId: PREVIEW_ID } ) );
	} );

	it( 'should insert into a selected container', () => {
		// Arrange.
		setEditor( [ { id: 'box', model: { get: () => 'e-div-block' } } ] );

		// Act.
		insertElement( tile );

		// Assert.
		expect( dropElement ).toHaveBeenCalledWith( expect.objectContaining( { containerId: 'box' } ) );
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
		insertElement( tile );

		// Assert.
		expect( dropElement ).toHaveBeenCalledWith(
			expect.objectContaining( { containerId: 'box', options: { at: 3, scrollIntoView: true } } )
		);
	} );

	it( 'should not insert on multi-selection', () => {
		// Arrange.
		setEditor( [ { id: 'a', model: { get: () => 'widget' } }, { id: 'b', model: { get: () => 'widget' } } ] );

		// Act.
		insertElement( tile );

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
		expect( () => insertElement( tile ) ).not.toThrow();
	} );

	it( 'should append to the parent when the selected widget is not found in it', () => {
		// Arrange.
		setEditor( [
			{
				id: 'w1',
				model: { get: () => 'widget' },
				parent: { id: 'box', model: { get: () => ( { findIndex: () => -1 } ) } },
			},
		] );

		// Act.
		insertElement( tile );

		// Assert.
		expect( dropElement ).toHaveBeenCalledWith(
			expect.objectContaining( { containerId: 'box', options: { at: undefined, scrollIntoView: true } } )
		);
	} );

	it( 'should pass the custom data to the drop', () => {
		// Arrange.
		const custom = { isPreset: true, preset_settings: { title: 'Preset' } };
		setEditor( [] );

		// Act.
		insertElement( { ...tile, custom } );

		// Assert.
		expect( dropElement ).toHaveBeenCalledWith(
			expect.objectContaining( { model: expect.objectContaining( { custom } ) } )
		);
	} );

	it( 'should track the add only when the drop succeeds', () => {
		// Arrange.
		setEditor( [] );
		const track = ( window as never as { elementorCommon: { eventsManager: { dispatchEvent: jest.Mock } } } )
			.elementorCommon.eventsManager.dispatchEvent;

		// Act.
		jest.mocked( dropElement ).mockReturnValueOnce( undefined as never );
		insertElement( tile );
		jest.mocked( dropElement ).mockReturnValueOnce( {} as never );
		insertElement( tile );

		// Assert.
		expect( track ).toHaveBeenCalledTimes( 1 );
		expect( track ).toHaveBeenCalledWith( 'add_element', expect.objectContaining( { widget_type: 'e-heading' } ) );
	} );
} );

describe( 'canInsertElements', () => {
	it( 'should allow inserting when the preview exists and the user can design', () => {
		// Arrange.
		setEditor( [] );

		// Act & Assert.
		expect( canInsertElements() ).toBe( true );
	} );

	it( 'should not allow inserting without the design capability', () => {
		// Arrange.
		setEditor( [], false );

		// Act & Assert.
		expect( canInsertElements() ).toBe( false );
	} );

	it( 'should not allow inserting before the editor is ready', () => {
		// Arrange.
		( window as never as Record< string, unknown > ).elementor = undefined;

		// Act & Assert.
		expect( canInsertElements() ).toBe( false );
	} );
} );
