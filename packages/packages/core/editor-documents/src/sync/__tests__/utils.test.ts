import { createMockDocumentData } from 'test-utils';

import { getV1DocumentsManager } from '../utils';

/**
 * This test exists only because this function is being used only inside event handlers,
 * and jest can't catch errors that are being thrown. Despite that, we need to test this
 * specific behavior to make sure that we don't break the whole app when V1 isn't available.
 * All of the other logic is tested as an integration test in the `sync-store.test.ts` file,
 * while this one is a unit test.
 *
 * @see https://github.com/testing-library/react-testing-library/issues/624
 */
describe( '@elementor/editor-documents - Sync Utils', () => {
	it( 'should throw when V1 documents manager is not available', () => {
		// Act & Assert.
		expect( () => {
			getV1DocumentsManager();
		} ).toThrow( 'Elementor Editor V1 documents manager not found' );
	} );
} );

describe( '@elementor/editor-documents - getV1DocumentsExitTo with return URL', () => {
	const RETURN_TO_KEY = 'elementor_app_return_to';

	let mockDocument;

	beforeEach( () => {
		sessionStorage.clear();

		mockDocument = createMockDocumentData( { id: 1 } );

		window.elementor = {
			getPreferences: () => 'this_post',
		};
	} );

	afterEach( () => {
		delete window.elementor;
	} );

	function getFreshExitTo( documentData ) {
		let result;

		jest.isolateModules( () => {
			const { getV1DocumentsExitTo } = require( '../utils' );
			result = getV1DocumentsExitTo( documentData );
		} );

		return result;
	}

	it( 'should return the sessionStorage URL when it is same-origin', () => {
		// Arrange.
		const returnUrl = 'http://localhost/site-editor/';
		sessionStorage.setItem( RETURN_TO_KEY, returnUrl );

		// Act.
		const result = getFreshExitTo( mockDocument );

		// Assert.
		expect( result ).toBe( returnUrl );
	} );

	it( 'should remove the sessionStorage key after reading', () => {
		// Arrange.
		sessionStorage.setItem( RETURN_TO_KEY, 'http://localhost/site-editor/' );

		// Act.
		getFreshExitTo( mockDocument );

		// Assert.
		expect( sessionStorage.getItem( RETURN_TO_KEY ) ).toBeNull();
	} );

	it( 'should fall back to exit preference when sessionStorage URL is cross-origin', () => {
		// Arrange.
		sessionStorage.setItem( RETURN_TO_KEY, 'https://evil.com/phish' );

		// Act.
		const result = getFreshExitTo( mockDocument );

		// Assert.
		expect( result ).toBe( mockDocument.config.urls.exit_to_dashboard );
	} );

	it( 'should fall back to exit preference when sessionStorage URL is invalid', () => {
		// Arrange.
		sessionStorage.setItem( RETURN_TO_KEY, 'not-a-valid-url' );

		// Act.
		const result = getFreshExitTo( mockDocument );

		// Assert.
		expect( result ).toBe( mockDocument.config.urls.exit_to_dashboard );
	} );

	it( 'should fall back to exit preference when sessionStorage is empty', () => {
		// Act.
		const result = getFreshExitTo( mockDocument );

		// Assert.
		expect( result ).toBe( mockDocument.config.urls.exit_to_dashboard );
	} );

	it( 'should cache the result and not re-read sessionStorage', () => {
		// Arrange.
		const returnUrl = 'http://localhost/site-editor/';
		sessionStorage.setItem( RETURN_TO_KEY, returnUrl );

		// Act — use the same module instance for both calls.
		let firstResult;
		let secondResult;

		jest.isolateModules( () => {
			const { getV1DocumentsExitTo } = require( '../utils' );
			firstResult = getV1DocumentsExitTo( mockDocument );

			// Set a new value — should be ignored due to caching.
			sessionStorage.setItem( RETURN_TO_KEY, 'http://localhost/other/' );
			secondResult = getV1DocumentsExitTo( mockDocument );
		} );

		// Assert.
		expect( firstResult ).toBe( returnUrl );
		expect( secondResult ).toBe( returnUrl );
	} );
} );
