import {
	clearPendingEditorRedirect,
	completeEditorRedirectOnDeployAck,
	EDITOR_REDIRECT_ACK_FALLBACK_MS,
	scheduleEditorRedirectAfterDeploy,
} from '../deploy-editor-redirect';

describe( 'deploy-editor-redirect', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.clearAllTimers();
		jest.useRealTimers();
	} );

	it( 'redirects on ack before the fallback timer fires', () => {
		const navigate = jest.fn();
		const pending = scheduleEditorRedirectAfterDeploy( '/editor', { navigate } );

		completeEditorRedirectOnDeployAck( pending, navigate );

		expect( navigate ).toHaveBeenCalledWith( '/editor' );
		jest.advanceTimersByTime( EDITOR_REDIRECT_ACK_FALLBACK_MS );
		expect( navigate ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'redirects via fallback when ack is never received', () => {
		const navigate = jest.fn();
		scheduleEditorRedirectAfterDeploy( '/editor', { navigate } );

		jest.advanceTimersByTime( EDITOR_REDIRECT_ACK_FALLBACK_MS );

		expect( navigate ).toHaveBeenCalledWith( '/editor' );
	} );

	it( 'clears the fallback timer when ack is received', () => {
		const navigate = jest.fn();
		const pending = scheduleEditorRedirectAfterDeploy( '/editor', { navigate } );

		completeEditorRedirectOnDeployAck( pending, navigate );
		clearPendingEditorRedirect( pending );

		jest.advanceTimersByTime( EDITOR_REDIRECT_ACK_FALLBACK_MS );

		expect( navigate ).toHaveBeenCalledTimes( 1 );
	} );
} );
