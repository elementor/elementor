import { canRedirectToEditorAfterDeploy, resolveEditorRedirectPageId } from '../can-redirect-after-deploy';

describe( 'resolveEditorRedirectPageId', () => {
	it( 'returns the last incremental page wp id', () => {
		expect(
			resolveEditorRedirectPageId( {
				isIncremental: true,
				pages: [ { id: 'planner-a' }, { id: 'planner-b' } ],
				pageIdMap: { 'planner-a': 10, 'planner-b': 99 },
			} )
		).toBe( 99 );
	} );

	it( 'returns null in incremental mode when pageIdMap is missing', () => {
		expect(
			resolveEditorRedirectPageId( {
				isIncremental: true,
				pages: [ { id: 'planner-a' } ],
			} )
		).toBeNull();
	} );

	it( 'returns homePageId in full mode', () => {
		expect(
			resolveEditorRedirectPageId( {
				isIncremental: false,
				homePageId: 5,
			} )
		).toBe( 5 );
	} );

	it( 'returns null when pages step failed', () => {
		expect(
			resolveEditorRedirectPageId( {
				isIncremental: true,
				pages: [ { id: 'planner-a' } ],
				pageIdMap: { 'planner-a': 10 },
				errors: [ 'pages: failed' ],
			} )
		).toBeNull();
	} );
} );

describe( 'canRedirectToEditorAfterDeploy', () => {
	it( 'returns true in incremental mode when the last page was deployed', () => {
		expect(
			canRedirectToEditorAfterDeploy( {
				isIncremental: true,
				pages: [ { id: 'planner-a' }, { id: 'planner-b' } ],
				pageIdMap: { 'planner-a': 10, 'planner-b': 99 },
			} )
		).toBe( true );
	} );

	it( 'returns false in incremental mode when pages are missing from the payload', () => {
		expect( canRedirectToEditorAfterDeploy( { isIncremental: true, pageIdMap: { 'planner-a': 10 } } ) ).toBe(
			false
		);
	} );

	it( 'returns false when homePageId is missing in full mode', () => {
		expect( canRedirectToEditorAfterDeploy( { isIncremental: false, errors: [] } ) ).toBe( false );
	} );

	it( 'returns false when pages step failed', () => {
		expect(
			canRedirectToEditorAfterDeploy( {
				isIncremental: false,
				homePageId: 5,
				errors: [ 'pages: failed' ],
			} )
		).toBe( false );
	} );

	it( 'returns false when home page step failed', () => {
		expect(
			canRedirectToEditorAfterDeploy( {
				isIncremental: false,
				homePageId: 5,
				errors: [ 'home_page: failed' ],
			} )
		).toBe( false );
	} );

	it( 'returns true when only design-system-related steps failed', () => {
		expect(
			canRedirectToEditorAfterDeploy( {
				isIncremental: false,
				homePageId: 5,
				errors: [ 'global_variables: boom' ],
			} )
		).toBe( true );
	} );

	it( 'returns true when there are no errors', () => {
		expect( canRedirectToEditorAfterDeploy( { isIncremental: false, homePageId: 10 } ) ).toBe( true );
	} );
} );
