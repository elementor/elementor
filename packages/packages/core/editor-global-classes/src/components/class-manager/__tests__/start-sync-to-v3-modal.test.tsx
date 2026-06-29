import * as React from 'react';
import { createMockTrackingModule, mockTracking } from 'test-utils';
import { ThemeProvider } from '@elementor/ui';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { StartSyncToV3Modal } from '../start-sync-to-v3-modal';

jest.mock( '../../../utils/tracking', () => createMockTrackingModule( 'trackGlobalClasses' ) );

const renderModal = ( props = {} ) => {
	const defaultProps = {
		externalOpen: true,
		classId: 'class-1',
		onExternalClose: jest.fn(),
		onConfirm: jest.fn(),
	};

	return {
		...render(
			<ThemeProvider>
				<StartSyncToV3Modal { ...defaultProps } { ...props } />
			</ThemeProvider>
		),
		props: { ...defaultProps, ...props },
	};
};

describe( 'StartSyncToV3Modal', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should track popup exposure when modal opens', async () => {
		renderModal();

		await waitFor( () => {
			expect( mockTracking ).toHaveBeenCalledWith( {
				event: 'classSyncToV3PopupShown',
				classId: 'class-1',
			} );
		} );
	} );

	it( 'should track popup click with sync action when confirming', async () => {
		const { props } = renderModal();

		fireEvent.click( screen.getByRole( 'button', { name: 'Sync to Global Fonts' } ) );

		await waitFor( () => {
			expect( mockTracking ).toHaveBeenCalledWith( {
				event: 'classSyncToV3PopupClick',
				classId: 'class-1',
				action: 'sync',
			} );
		} );

		expect( props.onConfirm ).toHaveBeenCalled();
		expect( props.onExternalClose ).toHaveBeenCalled();
	} );

	it( 'should track popup click with cancel action when cancelling', async () => {
		const { props } = renderModal();

		fireEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		await waitFor( () => {
			expect( mockTracking ).toHaveBeenCalledWith( {
				event: 'classSyncToV3PopupClick',
				classId: 'class-1',
				action: 'cancel',
			} );
		} );

		expect( props.onExternalClose ).toHaveBeenCalled();
		expect( props.onConfirm ).not.toHaveBeenCalled();
	} );

	it( 'should not track when modal is closed', () => {
		renderModal( { externalOpen: false } );

		expect( mockTracking ).not.toHaveBeenCalled();
	} );

	it( 'should track exposure again when modal is reopened', async () => {
		const { rerender } = render(
			<ThemeProvider>
				<StartSyncToV3Modal
					externalOpen
					classId="class-1"
					onExternalClose={ jest.fn() }
					onConfirm={ jest.fn() }
				/>
			</ThemeProvider>
		);

		await waitFor( () => {
			expect( mockTracking ).toHaveBeenCalledWith( {
				event: 'classSyncToV3PopupShown',
				classId: 'class-1',
			} );
		} );

		mockTracking.mockClear();

		rerender(
			<ThemeProvider>
				<StartSyncToV3Modal
					externalOpen={ false }
					classId="class-1"
					onExternalClose={ jest.fn() }
					onConfirm={ jest.fn() }
				/>
			</ThemeProvider>
		);

		rerender(
			<ThemeProvider>
				<StartSyncToV3Modal
					externalOpen
					classId="class-2"
					onExternalClose={ jest.fn() }
					onConfirm={ jest.fn() }
				/>
			</ThemeProvider>
		);

		await waitFor( () => {
			expect( mockTracking ).toHaveBeenCalledWith( {
				event: 'classSyncToV3PopupShown',
				classId: 'class-2',
			} );
		} );
	} );
} );
