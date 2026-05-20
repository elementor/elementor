import * as React from 'react';
import { createMockTrackingModule, mockTracking, renderWithQuery } from 'test-utils';
import { useUserStylesCapability } from '@elementor/editor-styles-repository';
import { fireEvent, screen } from '@testing-library/react';

jest.mock( '@elementor/editor-styles-repository', () => ( {
	...jest.requireActual( '@elementor/editor-styles-repository' ),
	useUserStylesCapability: jest.fn( () => ( {
		userCan: jest.fn().mockReturnValue( { update: true } ),
	} ) ),
} ) );

jest.mock( '../class-manager-panel', () => ( {
	usePanelActions: jest.fn( () => ( { open: jest.fn() } ) ),
} ) );

jest.mock( '../../../utils/tracking', () => createMockTrackingModule( 'trackGlobalClasses' ) );

import { ClassManagerButton } from '../class-manager-button';
import { usePanelActions } from '../class-manager-panel';

describe( 'ClassManagerButton', () => {
<<<<<<< HEAD
	const unsavedChangesMessage = 'You have unsaved changes';

	it( 'should navigate to the panel on click when the document is pristine', () => {
		// Arrange.
		const openPanel = jest.fn();

		jest.mocked( usePanelActions ).mockReturnValue( { open: openPanel } as never );

		jest.mocked( useActiveDocument ).mockReturnValue( {
			isDirty: false,
		} as never );

		jest.mocked( useActiveDocumentActions ).mockReturnValue( {
			save: jest.fn(),
		} as never );

=======
	let dispatchEventSpy: jest.SpyInstance;

	beforeEach( () => {
		dispatchEventSpy = jest.spyOn( window, 'dispatchEvent' );
	} );

	afterEach( () => {
		dispatchEventSpy.mockRestore();
	} );

	it( 'should navigate to the panel on click', () => {
>>>>>>> f4e4f16c00 (Fix: Inconsistent dirty document check between Design System tabs [ED-24099] (#35927))
		// Act.
		renderWithQuery( <ClassManagerButton /> );
		fireEvent.click( screen.getByLabelText( 'Class Manager' ) );

		// Assert.
<<<<<<< HEAD
		expect( openPanel ).toHaveBeenCalled();
		expect( mockTracking ).toHaveBeenCalledWith( {
			event: 'classManagerOpened',
			source: 'style-panel',
		} );
	} );

	it( 'should open the dialog if the document is dirty, and allow to cancel the action', () => {
		// Arrange.
		const save = jest.fn();
		const openPanel = jest.fn();

		jest.mocked( usePanelActions ).mockReturnValue( { open: openPanel } as never );

		jest.mocked( useActiveDocument ).mockReturnValue( {
			isDirty: true,
		} as never );

		jest.mocked( useActiveDocumentActions ).mockReturnValue( {
			save,
		} as never );

=======
		expect( dispatchEventSpy ).toHaveBeenCalledWith(
			expect.objectContaining( {
				type: 'elementor/toggle-design-system',
				detail: { tab: 'classes' },
			} )
		);
	} );

	it( 'should track classManagerOpened event on click', () => {
>>>>>>> f4e4f16c00 (Fix: Inconsistent dirty document check between Design System tabs [ED-24099] (#35927))
		// Act.
		renderWithQuery( <ClassManagerButton /> );

		fireEvent.click( screen.getByLabelText( 'Class Manager' ) );

		// Assert.
<<<<<<< HEAD
		expect( screen.getByText( unsavedChangesMessage ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Stay here' } ) );

		// Assert.
		expect( screen.queryByText( unsavedChangesMessage ) ).not.toBeInTheDocument();
		expect( save ).not.toHaveBeenCalled();
		expect( openPanel ).not.toHaveBeenCalled();
		expect( mockTracking ).not.toHaveBeenCalled();
	} );

	it( 'should open the dialog if the document is dirty, and allow to save and continue', async () => {
		// Arrange.
		const save = jest.fn().mockResolvedValue( null );
		const openPanel = jest.fn();

		jest.mocked( usePanelActions ).mockReturnValue( { open: openPanel } as never );

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
		expect( openPanel ).toHaveBeenCalled();
=======
>>>>>>> f4e4f16c00 (Fix: Inconsistent dirty document check between Design System tabs [ED-24099] (#35927))
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
