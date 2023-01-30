import { getV1DocumentsManager } from '../utils';

/**
 * This test exists only because this function is being used only inside event handlers,
 * and jest can't catch errors that are being thrown. Despite that, we need to test this
 * specific behavior to make sure that we don't break the whole app when V1 isn't available.
 *
 * @see https://github.com/testing-library/react-testing-library/issues/624
 */
describe( '@elementor/documents/store/utils', () => {
	it( 'should throw when V1 documents manager is not available', () => {
		// Act & Assert.
		expect( () => {
			getV1DocumentsManager();
		} ).toThrow( 'Elementor Editor V1 documents manager not found' );
	} );
} );
