import * as React from 'react';
import { createMockTrackingModule, mockTracking, renderWithQuery } from 'test-utils';
import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import { useUserStylesCapability } from '@elementor/editor-styles-repository';
import { fireEvent, screen, waitFor } from '@testing-library/react';

jest.mock( '@elementor/editor-documents' );
jest.mock( '@elementor/editor-styles-repository', () => ( {
	...jest.requireActual( '@elementor/editor-styles-repository' ),
	useUserStylesCapability: jest.fn( () => ( {
		userCan: jest.fn().mockReturnValue( { update: true } ),
	} ) ),
} ) );

jest.mock( '../../../utils/tracking', () => createMockTrackingModule( 'trackGlobalClasses' ) );

import { ClassManagerButton } from '../class-manager-button';

describe( 'ClassManagerButton', () => {
	const unsavedChangesMessage = 'You have unsaved changes';
	let dispatchEventSpy: jest.SpyInstance;

	beforeEach( () => {
		dispatchEventSpy = jest.spyOn( window, 'dispatchEvent' );
	} );

	afterEach( () => {
		dispatchEventSpy.mockRestore();
	} );

	it( 'should navigate to the panel on click when the document is pristine', () => {
		// Arrange.
		jest.mocked( useActiveDocument ).mockReturnValue( {
			isDirty: false,
		} as never );

		jest.mocked( useActiveDocumentActions ).mockReturnValue( {
			save: jest.fn(),
		} as never );

		// Act.
		renderWithQuery( <ClassManagerButton /> );

		fireEvent.click( screen.getByLabelText( 'Class Manager' ) );

		// Assert.
		expect( dispatchEventSpy ).toHaveBeenCalledWith(
			expect.objectContaining( {
				type: 'elementor/toggle-design-system',
				detail: { tab: 'classes' },
			} )
		);
		expect( mockTracking ).toHaveBeenCalledWith( {
			event: 'classManagerOpened',
			source: 'style-panel',
		} );
	} );

	it( 'should open the dialog if the document is dirty, and allow to cancel the action', () => {
		// Arrange.
		const save = jest.fn();

		jest.mocked( useActiveDocument ).mockReturnValue( {
			isDirty: true,
		} as never );

		jest.mocked( useActiveDocumentActions ).mockReturnValue( {
			save,
		} as never );

		// Act.
		renderWithQuery( <ClassManagerButton /> );

		fireEvent.click( screen.getByLabelText( 'Class Manager' ) );

		// Assert.
		expect( screen.getByText( unsavedChangesMessage ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Stay here' } ) );

		// Assert.
		expect( screen.queryByText( unsavedChangesMessage ) ).not.toBeInTheDocument();
		expect( save ).not.toHaveBeenCalled();
		expect( dispatchEventSpy ).not.toHaveBeenCalledWith(
			expect.objectContaining( { type: 'elementor/toggle-design-system' } )
		);
		expect( mockTracking ).not.toHaveBeenCalled();
	} );

	it( 'should open the dialog if the document is dirty, and allow to save and continue', async () => {
		// Arrange.
		const save = jest.fn().mockResolvedValue( null );

		jest.mocked( useActiveDocument ).mockReturnValue( {
			isDirty: true,
		} as never );

		jest.mocked( useActiveDocumentActions ).mockReturnValue( {
			save,
		} as never );

		renderWithQuery( <ClassManagerButton /> );

		// Act.
		fireEvent.click( screen.getByLabelText( 'Class Manager' ) );

		// Assert.
		expect( screen.getByText( unsavedChangesMessage ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Save & Continue' } ) );

		// Assert.
		await waitFor( () => {
			expect( screen.queryByText( unsavedChangesMessage ) ).not.toBeInTheDocument();
		} );

		expect( save ).toHaveBeenCalled();
		expect( dispatchEventSpy ).toHaveBeenCalledWith(
			expect.objectContaining( {
				type: 'elementor/toggle-design-system',
				detail: { tab: 'classes' },
			} )
		);
		expect( mockTracking ).toHaveBeenCalledWith( {
			event: 'classManagerOpened',
			source: 'style-panel',
		} );
	} );

	it( 'should not render the button if the user does not have permission to update classes', () => {
		// Arrange.
		jest.mocked( useUserStylesCapability ).mockReturnValue( {
			userCan: jest.fn().mockReturnValue( { update: false } ),
		} );

		// Act.
		const { container } = renderWithQuery( <ClassManagerButton /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
