import { expect } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';

export async function testIconCount( editor: EditorPage ) {
	// Act.
	const iconCountForTabs = await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active .elementor-add-new-section i' ).count(),
		iconCountForMainContainer = await editor.getPreviewFrame().locator( '#elementor-add-new-section .elementor-add-new-section i' ).count();

	// Assert.
	// Tabs add-section area has 1 icon; main container has add-section + add-template + Build with AI.
	expect.soft( iconCountForTabs ).toBe( 1 );
	expect.soft( iconCountForMainContainer ).toEqual( 3 );
}
