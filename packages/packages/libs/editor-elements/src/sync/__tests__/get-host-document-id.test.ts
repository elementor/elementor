import { getHostDocumentId } from '@elementor/editor-elements';

import { type ExtendedWindow } from '../types';

describe( 'getHostDocumentId', () => {
	it( 'returns the initial document id', () => {
		// Arrange.
		const extendedWindow = window as unknown as ExtendedWindow;
		extendedWindow.elementor = {
			documents: {
				getInitialId: () => 49,
			},
		};

		// Act.
		const hostDocumentId = getHostDocumentId();

		// Assert.
		expect( hostDocumentId ).toBe( 49 );
	} );

	it( 'returns null when the v1 documents manager is unavailable', () => {
		// Arrange.
		const extendedWindow = window as unknown as ExtendedWindow;
		extendedWindow.elementor = undefined;

		// Act.
		const hostDocumentId = getHostDocumentId();

		// Assert.
		expect( hostDocumentId ).toBeNull();
	} );
} );
