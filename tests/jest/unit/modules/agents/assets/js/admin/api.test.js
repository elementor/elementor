import apiFetch from '@wordpress/api-fetch';

import { fetchMarkdownPreview, revertMarkdownContent, runSiteScan, saveMarkdownContent } from 'elementor/modules/agents/assets/js/admin/api';

jest.mock( '@wordpress/api-fetch', () => jest.fn() );

const SCAN_PATH = '/elementor/v1/agents-ready/scan';
const RETRY_AT = '2026-10-21T10:00:00Z';

describe( 'runSiteScan', () => {
	beforeEach( () => {
		apiFetch.mockReset();
	} );

	it( 'posts the scan and maps the report', async () => {
		// Arrange
		apiFetch.mockResolvedValue( {
			data: {
				report: {
					score: 10,
					checks: [],
					layers: {},
				},
				retryAt: RETRY_AT,
			},
		} );

		// Act
		const result = await runSiteScan();

		// Assert
		expect( apiFetch ).toHaveBeenCalledWith( { path: SCAN_PATH, method: 'POST' } );
		expect( result ).toMatchObject( {
			score: 10,
			retryAt: RETRY_AT,
			checks: [],
		} );
	} );

	it( 'maps a failed response onto status, reason, and retryAt', async () => {
		// Arrange
		apiFetch.mockRejectedValue( {
			message: 'Slow down',
			data: {
				status: 429,
				meta: {
					reason: 'throttled',
					retryAt: RETRY_AT,
				},
			},
		} );

		// Act
		const scan = runSiteScan();

		// Assert
		await expect( scan ).rejects.toMatchObject( {
			message: 'Slow down',
			status: 429,
			reason: 'throttled',
			retryAt: RETRY_AT,
		} );
	} );
} );

describe( 'markdown ajax helpers', () => {
	const POST_ID = 12;

	const mockAjaxSuccess = ( response ) => {
		elementorCommon.ajax.addRequest.mockImplementation( ( action, { success } ) => success( response ) );
	};

	beforeEach( () => {
		global.elementorCommon = { ajax: { addRequest: jest.fn() } };
	} );

	afterEach( () => {
		delete global.elementorCommon;
	} );

	it( 'resolves the preview with its content and override flag', async () => {
		// Arrange
		mockAjaxSuccess( { content: '# Edited', isOverridden: true } );

		// Act
		const preview = await fetchMarkdownPreview( POST_ID );

		// Assert
		expect( elementorCommon.ajax.addRequest ).toHaveBeenCalledWith(
			'agents_ready_preview_markdown',
			expect.objectContaining( { data: { postId: POST_ID } } ),
		);
		expect( preview ).toEqual( { content: '# Edited', isOverridden: true } );
	} );

	it( 'defaults the preview to generated content when the response has no override flag', async () => {
		// Arrange
		mockAjaxSuccess( {} );

		// Act
		const preview = await fetchMarkdownPreview( POST_ID );

		// Assert
		expect( preview ).toEqual( { content: '', isOverridden: false } );
	} );

	it( 'saves the markdown override for a post', async () => {
		// Arrange
		mockAjaxSuccess( { isOverridden: true } );

		// Act
		const result = await saveMarkdownContent( POST_ID, '# Edited' );

		// Assert
		expect( elementorCommon.ajax.addRequest ).toHaveBeenCalledWith(
			'agents_ready_save_markdown_content',
			expect.objectContaining( { data: { postId: POST_ID, content: '# Edited' } } ),
		);
		expect( result ).toEqual( { isOverridden: true } );
	} );

	it( 'reverts the markdown override for a post', async () => {
		// Arrange
		mockAjaxSuccess( { isOverridden: false } );

		// Act
		const result = await revertMarkdownContent( POST_ID );

		// Assert
		expect( elementorCommon.ajax.addRequest ).toHaveBeenCalledWith(
			'agents_ready_revert_markdown_content',
			expect.objectContaining( { data: { postId: POST_ID } } ),
		);
		expect( result ).toEqual( { isOverridden: false } );
	} );

	it( 'rejects with the server error when saving fails', async () => {
		// Arrange
		const serverError = 'Permission denied.';
		elementorCommon.ajax.addRequest.mockImplementation( ( action, { error } ) => error( serverError ) );

		// Act
		const save = saveMarkdownContent( POST_ID, '# Edited' );

		// Assert
		await expect( save ).rejects.toBe( serverError );
	} );
} );
