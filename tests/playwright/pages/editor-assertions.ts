import { expect } from '@playwright/test';
import { timeouts } from '../config/timeouts';
import type { EditorDriver } from '../drivers/editor-driver';

export class EditorAssertions {
	static async verifyCSSProperties(
		driver: EditorDriver,
		selector: string,
		cssExpectations: Array<{ property: string; value: string }>,
		timeout = timeouts.expect,
	): Promise<void> {
		const element = driver.editor.getPreviewFrame().locator( selector );
		for ( const { property, value } of cssExpectations ) {
			await expect( element ).toHaveCSS( property, value, { timeout } );
		}
	}

	static async verifyButtonsPressed(
		driver: EditorDriver,
		buttonExpectations: Array<{ buttonName: string; isPressed: boolean }>,
		timeout = timeouts.expect,
	): Promise<void> {
		const stylePanel = driver.page.getByRole( 'tabpanel', { name: 'Style' } );
		for ( const { buttonName, isPressed } of buttonExpectations ) {
			const button = stylePanel.getByRole( 'button', { name: buttonName } );
			await expect( button ).toHaveAttribute( 'aria-pressed', String( isPressed ), { timeout } );
		}
	}
}

