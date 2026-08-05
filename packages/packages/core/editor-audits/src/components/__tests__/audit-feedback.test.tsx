import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { notify } from '@elementor/editor-notifications';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { httpService } from '@elementor/http-client';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { FEEDBACK_ENTRY_POINT } from '../../constants';
import AuditFeedback from '../audit-feedback';

const mockTrackEvent = jest.fn();

jest.mock( '@elementor/events', () => ( {
	useMixpanel: () => ( { dispatchEvent: mockTrackEvent } ),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	isExperimentActive: jest.fn(),
} ) );

jest.mock( '@elementor/editor-notifications', () => ( {
	notify: jest.fn(),
} ) );

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

const openModal = () => fireEvent.click( screen.getByRole( 'button', { name: 'Give feedback' } ) );

const mockPost = ( implementation: ( ...args: unknown[] ) => Promise< unknown > ) => {
	const post = jest.fn( implementation );
	( httpService as jest.Mock ).mockReturnValue( { post } );
	return post;
};

const mockConnected = ( isConnected: boolean ) => {
	window.elementorCommon = { config: { library_connect: { is_connected: isConnected } } };
};

describe( 'AuditFeedback', () => {
	beforeEach( () => {
		mockTrackEvent.mockReset();
		( notify as jest.Mock ).mockReset();
		jest.mocked( isExperimentActive ).mockReturnValue( true );
		mockConnected( true );
	} );

	afterEach( () => {
		delete window.elementorCommon;
		delete window.elementorPro;
	} );

	it( 'renders nothing when the feedback experiment is inactive', () => {
		jest.mocked( isExperimentActive ).mockReturnValue( false );

		const { container } = renderWithTheme( <AuditFeedback /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'still renders the trigger button when the user is not connected to their Elementor account', () => {
		mockConnected( false );

		renderWithTheme( <AuditFeedback /> );

		expect( screen.getByRole( 'button', { name: 'Give feedback' } ) ).toBeInTheDocument();
	} );

	it( 'opens the dialog and tracks the click event when the trigger is clicked', () => {
		renderWithTheme( <AuditFeedback /> );

		openModal();

		expect( screen.getByText( 'Let us know what you think' ) ).toBeInTheDocument();
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'audit_feedback_clicked', {
			entry_point: FEEDBACK_ENTRY_POINT,
			connected: true,
		} );
	} );

	it( 'opens the connect URL in a new tab and does not open the dialog when the user is not connected', () => {
		mockConnected( false );
		window.elementor = { config: { user: { top_bar: { connect_url: 'https://my.elementor.com/connect' } } } };
		const windowOpenSpy = jest.spyOn( window, 'open' ).mockImplementation( () => null );

		renderWithTheme( <AuditFeedback /> );
		openModal();

		expect( windowOpenSpy ).toHaveBeenCalledWith( 'https://my.elementor.com/connect', '_blank', 'noopener' );
		expect( screen.queryByText( 'Let us know what you think' ) ).not.toBeInTheDocument();
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'audit_feedback_clicked', {
			entry_point: FEEDBACK_ENTRY_POINT,
			connected: false,
		} );

		windowOpenSpy.mockRestore();
		delete window.elementor;
	} );

	it( 'closes the dialog without submitting and tracks the cancel event when Cancel is clicked', async () => {
		const post = mockPost( () => Promise.resolve( { data: { success: true } } ) );
		renderWithTheme( <AuditFeedback /> );
		openModal();

		fireEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		await waitFor( () => expect( screen.queryByText( 'Let us know what you think' ) ).not.toBeInTheDocument() );
		expect( post ).not.toHaveBeenCalled();
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'audit_feedback_cancelled', {
			entry_point: FEEDBACK_ENTRY_POINT,
		} );
	} );

	it( 'closes the dialog without submitting and tracks the close event when the close button is clicked', async () => {
		const post = mockPost( () => Promise.resolve( { data: { success: true } } ) );
		renderWithTheme( <AuditFeedback /> );
		openModal();

		fireEvent.click( screen.getByRole( 'button', { name: /close/i } ) );

		await waitFor( () => expect( screen.queryByText( 'Let us know what you think' ) ).not.toBeInTheDocument() );
		expect( post ).not.toHaveBeenCalled();
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'audit_feedback_closed', {
			entry_point: FEEDBACK_ENTRY_POINT,
		} );
	} );

	it( 'submits feedback, closes the dialog and shows a success notification', async () => {
		const post = mockPost( () => Promise.resolve( { data: { success: true } } ) );
		renderWithTheme( <AuditFeedback /> );
		openModal();

		fireEvent.change( screen.getByPlaceholderText( /Tell us what you had in mind/ ), {
			target: { value: 'Great feature, but slow.' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: 'Send' } ) );

		expect( post ).toHaveBeenCalledWith( 'elementor/v1/feedback/submit', {
			subject: 'Page Audit Tool',
			description: 'Great feature, but slow.',
		} );

		await waitFor( () =>
			expect( notify ).toHaveBeenCalledWith(
				expect.objectContaining( { type: 'success', message: 'Feedback sent. Thanks for helping us out.' } )
			)
		);
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'audit_feedback_sent', {
			entry_point: FEEDBACK_ENTRY_POINT,
		} );
		await waitFor( () => expect( screen.queryByText( 'Let us know what you think' ) ).not.toBeInTheDocument() );
	} );

	it( 'keeps the dialog open with the typed text and shows an error notification when the server reports failure', async () => {
		mockPost( () => Promise.resolve( { data: { success: false } } ) );
		renderWithTheme( <AuditFeedback /> );
		openModal();

		fireEvent.change( screen.getByPlaceholderText( /Tell us what you had in mind/ ), {
			target: { value: 'Feedback text' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: 'Send' } ) );

		await waitFor( () =>
			expect( notify ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: 'error',
					message: 'Something went wrong. Please try sending your feedback again.',
				} )
			)
		);
		expect( screen.getByText( 'Let us know what you think' ) ).toBeInTheDocument();
		expect( screen.getByPlaceholderText( /Tell us what you had in mind/ ) ).toHaveValue( 'Feedback text' );
	} );

	it( 'keeps the dialog open and shows an error notification when the request rejects', async () => {
		mockPost( () => Promise.reject( new Error( 'network error' ) ) );
		renderWithTheme( <AuditFeedback /> );
		openModal();

		fireEvent.change( screen.getByPlaceholderText( /Tell us what you had in mind/ ), {
			target: { value: 'Feedback text' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: 'Send' } ) );

		await waitFor( () => expect( notify ).toHaveBeenCalledWith( expect.objectContaining( { type: 'error' } ) ) );
		expect( screen.getByText( 'Let us know what you think' ) ).toBeInTheDocument();
	} );

	it( 'disables the Send button while the text field is empty', () => {
		renderWithTheme( <AuditFeedback /> );
		openModal();

		expect( screen.getByRole( 'button', { name: 'Send' } ) ).toBeDisabled();
	} );
} );
