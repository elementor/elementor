import * as editorControls from '../index';

describe( 'editor-controls exports consumed by Pro at runtime', () => {
	it( 'should expose the icon library upload seam under the names Pro looks up', () => {
		// Assert.
		expect( typeof editorControls.injectIntoIconLibraryUploadAction ).toBe( 'function' );
		expect( typeof editorControls.IconLibraryUploadPromotion ).toBe( 'function' );
	} );
} );
