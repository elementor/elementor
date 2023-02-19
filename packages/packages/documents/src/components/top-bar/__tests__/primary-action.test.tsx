import PrimaryAction from '../primary-action';
import { render } from '@testing-library/react';
import { createMockDocument } from '../../../__tests__/test-utils';
import { useActiveDocument, useActiveDocumentActions } from '../../../hooks';

jest.mock( '../../../hooks', () => ( {
	useActiveDocument: jest.fn(),
	useActiveDocumentActions: jest.fn(),
} ) );

const mockedUseActiveDocument = jest.mocked( useActiveDocument );

const actionsMock = {
	save: jest.fn(),
	saveDraft: jest.fn(),
	saveTemplate: jest.fn(),
};

jest.mocked( useActiveDocumentActions ).mockReturnValue( actionsMock );

describe( '@elementor/documents - Top Bar Primary Action', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should not render when there is no active document', () => {
		// Arrange.
		mockedUseActiveDocument.mockReturnValue( null );

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

		mockedUseActiveDocument.mockReturnValue( mockDocument );

		// Act.
		const { getByRole } = render( <PrimaryAction /> );

		// Assert.
		expect( getByRole( 'button' ) ).toHaveTextContent( 'Submit' );
	} );

	it( 'should have "Publish" text when the user can publish the document', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			userCan: {
				publish: true,
			},
		} );

		mockedUseActiveDocument.mockReturnValue( mockDocument );

		// Act.
		const { getByRole } = render( <PrimaryAction /> );

		// Assert.
		expect( getByRole( 'button' ) ).toHaveTextContent( 'Publish' );
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

		mockedUseActiveDocument.mockReturnValue( mockDocument );

		// Act.
		const { getByRole } = render( <PrimaryAction /> );

		// Assert.
		expect( getByRole( 'button' ) ).toBeDisabled();
	} );

	it( 'should be disabled when the document is pristine', () => {
		// Arrange.
		const mockDocument = createMockDocument( { isDirty: false } );

		mockedUseActiveDocument.mockReturnValue( mockDocument );

		// Act.
		const { getByRole } = render( <PrimaryAction /> );

		// Assert.
		expect( getByRole( 'button' ) ).toBeDisabled();
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

		mockedUseActiveDocument.mockReturnValue( mockDocument );

		// Act.
		const { getByRole } = render( <PrimaryAction /> );

		// Assert.
		expect( getByRole( 'button' ) ).toBeEnabled();
	} );

	it( 'should save the active document on click', () => {
		// Arrange.
		const mockDocument = createMockDocument( { isDirty: true } );

		mockedUseActiveDocument.mockReturnValue( mockDocument );

		// Act.
		const { getByRole } = render( <PrimaryAction /> );

		getByRole( 'button' )?.click();

		// Assert.
		expect( actionsMock.save ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should show a loader & not save when there is save in progress', () => {
		// Arrange.
		const mockDocument = createMockDocument( {
			isDirty: true,
			isSaving: true,
		} );

		mockedUseActiveDocument.mockReturnValue( mockDocument );

		// Act.
		const { getByRole } = render( <PrimaryAction /> );

		const button = getByRole( 'button' );
		const loader = getByRole( 'progressbar' );

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

		mockedUseActiveDocument.mockReturnValue( mockDocument );

		// Act.
		const { getByRole, queryByRole } = render( <PrimaryAction /> );
		const button = getByRole( 'button' );
		const loader = queryByRole( 'progressbar' );

		// Assert.
		expect( loader ).not.toBeInTheDocument();
		expect( button.textContent ).not.toBe( '' );
	} );
} );
