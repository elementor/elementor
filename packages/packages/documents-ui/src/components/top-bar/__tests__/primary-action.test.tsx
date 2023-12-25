import PrimaryAction from '../primary-action';
import { render } from '@testing-library/react';
import { createMockDocument } from 'test-utils';
import { useActiveDocument, useActiveDocumentActions } from '@elementor/documents';

jest.mock( '@elementor/documents', () => ( {
	useActiveDocument: jest.fn(),
	useActiveDocumentActions: jest.fn(),
} ) );

const actionsMock = {
	save: jest.fn(),
	saveDraft: jest.fn(),
	saveTemplate: jest.fn(),
};

jest.mocked( useActiveDocumentActions ).mockReturnValue( actionsMock );

describe( '@elementor/documents-ui - Top Bar Primary Action', () => {
	it( 'should not render when there is no active document', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( null );

		// Act.
		const { container } = render( <PrimaryAction /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should have "Submit" text when the user cannot publish the document', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			userCan: {
				publish: false,
			},
		} );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		const { getAllByRole } = render( <PrimaryAction /> );

		// Assert.
		expect( getAllByRole( 'button' )[ 0 ] ).toHaveTextContent( 'Submit' );
	} );

	it( 'should have "Publish" text when the user can publish the document', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			userCan: {
				publish: true,
			},
		} );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		const { getAllByRole } = render( <PrimaryAction /> );

		// Assert.
		expect( getAllByRole( 'button' )[ 0 ] ).toHaveTextContent( 'Publish' );
	} );

	it( 'should be disabled when the document is a Kit', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			isDirty: true,
			type: {
				value: 'kit',
				label: 'Kit',
			},
		} );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		const { getAllByRole } = render( <PrimaryAction /> );

		// Assert.
		expect( getAllByRole( 'button' )[ 0 ] ).toBeDisabled();
	} );

	it( 'should be disabled when the document is pristine', () => {
		// Arrange.
		const mockDocument = createMockDocument( { isDirty: false } );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		const { getAllByRole } = render( <PrimaryAction /> );

		// Assert.
		expect( getAllByRole( 'button' )[ 0 ] ).toBeDisabled();
	} );

	it( 'should always be enabled when the document status is draft', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			isDirty: false,
			status: {
				value: 'draft',
				label: 'Draft',
			},
		} );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		const { getAllByRole } = render( <PrimaryAction /> );

		// Assert.
		expect( getAllByRole( 'button' )[ 0 ] ).toBeEnabled();
	} );

	it( 'should save the active document on click', () => {
		// Arrange.
		const mockDocument = createMockDocument( { isDirty: true } );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		const { getAllByRole } = render( <PrimaryAction /> );

		getAllByRole( 'button' )[ 0 ]?.click();

		// Assert.
		expect( actionsMock.save ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should show a loader & not save when there is save in progress', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			isDirty: true,
			isSaving: true,
		} );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		const { getAllByRole } = render( <PrimaryAction /> );

		const button = getAllByRole( 'button' )[ 0 ];
		const loader = getAllByRole( 'progressbar' )[ 0 ];

		button?.click();

		// Assert.
		expect( actionsMock.save ).not.toHaveBeenCalled();
		expect( loader ).toBeInTheDocument();
		expect( button.textContent ).toBe( '' );
	} );

	it( 'should not show a loader when the button is disabled', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			type: {
				value: 'kit',
				label: 'Kit',
			}, // Disables the button.
			isSaving: true,
		} );

		jest.mocked( useActiveDocument ).mockReturnValue( mockDocument );

		// Act.
		const { getAllByRole, queryByRole } = render( <PrimaryAction /> );
		const button = getAllByRole( 'button' )[ 0 ];
		const loader = queryByRole( 'progressbar' );

		// Assert.
		expect( loader ).not.toBeInTheDocument();
		expect( button.textContent ).not.toBe( '' );
	} );
} );
