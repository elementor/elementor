import { canRedirectToEditorAfterDeploy } from '../can-redirect-after-deploy';

describe( 'canRedirectToEditorAfterDeploy', () => {
	it( 'returns false in incremental mode', () => {
		expect(
			canRedirectToEditorAfterDeploy( { isIncremental: true, homePageId: 5, errors: [] } ),
		).toBe( false );
	} );

	it( 'returns false when homePageId is missing', () => {
		expect( canRedirectToEditorAfterDeploy( { isIncremental: false, errors: [] } ) ).toBe( false );
	} );

	it( 'returns false when pages step failed', () => {
		expect(
			canRedirectToEditorAfterDeploy( {
				isIncremental: false,
				homePageId: 5,
				errors: [ 'pages: failed' ],
			} ),
		).toBe( false );
	} );

	it( 'returns false when home page step failed', () => {
		expect(
			canRedirectToEditorAfterDeploy( {
				isIncremental: false,
				homePageId: 5,
				errors: [ 'home_page: failed' ],
			} ),
		).toBe( false );
	} );

	it( 'returns true when only design-system-related steps failed', () => {
		expect(
			canRedirectToEditorAfterDeploy( {
				isIncremental: false,
				homePageId: 5,
				errors: [ 'global_variables: boom' ],
			} ),
		).toBe( true );
	} );

	it( 'returns true when there are no errors', () => {
		expect(
			canRedirectToEditorAfterDeploy( { isIncremental: false, homePageId: 10 } ),
		).toBe( true );
	} );
} );
