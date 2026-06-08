import {
	clearPendingEditorRedirect,
	completeEditorRedirectOnDeployAcknowledge,
	EDITOR_REDIRECT_ACKNOWLEDGE_FALLBACK_MS,
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

	it( 'redirects on acknowledge before the fallback timer fires', () => {
		const navigate = jest.fn();
		const pending = scheduleEditorRedirectAfterDeploy( '/editor', { navigate } );

		completeEditorRedirectOnDeployAcknowledge( pending, navigate );

		expect( navigate ).toHaveBeenCalledWith( '/editor' );
		jest.advanceTimersByTime( EDITOR_REDIRECT_ACKNOWLEDGE_FALLBACK_MS );
		expect( navigate ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'redirects via fallback when acknowledge is never received', () => {
		const navigate = jest.fn();
		scheduleEditorRedirectAfterDeploy( '/editor', { navigate } );

		jest.advanceTimersByTime( EDITOR_REDIRECT_ACKNOWLEDGE_FALLBACK_MS );

		expect( navigate ).toHaveBeenCalledWith( '/editor' );
	} );

	it( 'clears the fallback timer when acknowledge is received', () => {
		const navigate = jest.fn();
		const pending = scheduleEditorRedirectAfterDeploy( '/editor', { navigate } );

		completeEditorRedirectOnDeployAcknowledge( pending, navigate );
		clearPendingEditorRedirect( pending );

		jest.advanceTimersByTime( EDITOR_REDIRECT_ACKNOWLEDGE_FALLBACK_MS );

		expect( navigate ).toHaveBeenCalledTimes( 1 );
	} );
} );
