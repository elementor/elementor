import { updateElementEditorSettings } from '@elementor/editor-elements';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from '../get-container';

jest.mock( '../get-container' );
jest.mock( '@elementor/editor-v1-adapters' );

describe( 'updateElementEditorSettings', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should update element editor settings successfully', () => {
		// Arrange.
		const elementId = 'test-element-id';
		const existingSettings = { title: 'Existing Title' };
		const newSettings = { title: 'New Title' };
		const element = createMockContainer( elementId );

		jest.mocked( element.model.get ).mockReturnValue( existingSettings );

		// Act.
		updateElementEditorSettings( {
			elementId,
			settings: newSettings,
		} );

		// Assert.
		expect( element.model.get ).toHaveBeenCalledWith( 'editor_settings' );
		expect( element.model.set ).toHaveBeenCalledWith( 'editor_settings', {
			...existingSettings,
			...newSettings,
		} );
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/save/set-is-modified',
			{ status: true },
			{ internal: true }
		);
	} );

	it( 'should handle element with no existing editor settings', () => {
		// Arrange.
		const elementId = 'test-element-id';
		const newSettings = { title: 'New Title' };
		const element = createMockContainer( elementId );

		jest.mocked( element.model.get ).mockReturnValue( undefined );

		// Act.
		updateElementEditorSettings( {
			elementId,
			settings: newSettings,
		} );

		// Assert.
		expect( element.model.get ).toHaveBeenCalledWith( 'editor_settings' );
		expect( element.model.set ).toHaveBeenCalledWith( 'editor_settings', newSettings );
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/save/set-is-modified',
			{ status: true },
			{ internal: true }
		);
	} );

	it( 'should throw error when element is not found', () => {
		// Arrange.
		const elementId = 'non-existent-element-id';
		const newSettings = { title: 'New Title' };

		jest.mocked( getContainer ).mockReturnValue( null );

		// Act & Assert.
		expect( () => {
			updateElementEditorSettings( {
				elementId,
				settings: newSettings,
			} );
		} ).toThrow( `Element with id ${ elementId } not found` );

		expect( runCommandSync ).not.toHaveBeenCalled();
	} );

	it( 'should merge multiple settings updates correctly', () => {
		// Arrange.
		const elementId = 'test-element-id';
		const existingSettings = { title: 'Original Title' };
		const firstUpdate = { title: 'First Update' };
		const secondUpdate = { title: 'Second Update' };
		const element = createMockContainer( elementId );

		jest.mocked( element.model.get ).mockReturnValue( existingSettings );

		// Act.
		updateElementEditorSettings( {
			elementId,
			settings: firstUpdate,
		} );

		updateElementEditorSettings( {
			elementId,
			settings: secondUpdate,
		} );

		// Assert.
		expect( element.model.set ).toHaveBeenNthCalledWith( 1, 'editor_settings', {
			...existingSettings,
			...firstUpdate,
		} );
		expect( element.model.set ).toHaveBeenNthCalledWith( 2, 'editor_settings', {
			...existingSettings,
			...firstUpdate,
			...secondUpdate,
		} );
		expect( runCommandSync ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should call setDocumentModifiedStatus with correct parameters', () => {
		// Arrange.
		const elementId = 'test-element-id';
		const newSettings = { title: 'Test Title' };
		const element = createMockContainer( elementId );

		jest.mocked( element.model.get ).mockReturnValue( {} );

		// Act.
		updateElementEditorSettings( {
			elementId,
			settings: newSettings,
		} );

		// Assert.
		expect( runCommandSync ).toHaveBeenCalledWith(
			'document/save/set-is-modified',
			{ status: true },
			{ internal: true }
		);
	} );
} );

function createMockElement( id: string ) {
	return {
		id,
		model: {
			get: jest.fn(),
			set: jest.fn(),
		},
	};
}

function createMockContainer( elementId: string ) {
	const element = createMockElement( elementId );
	jest.mocked( getContainer ).mockImplementation( ( id ) => {
		return id === elementId ? ( element as never ) : null;
	} );
	return element;
}
