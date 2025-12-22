import { expect, Frame, Locator, Page } from '@playwright/test';
import { AtomicTabsSelectors } from '../../selectors/atomic-tabs-selectors';

export class AtomicTabsWidget {
	private readonly frame: Frame;
	private readonly tabsId: string;

	constructor( frame: Frame, tabsId: string ) {
		this.frame = frame;
		this.tabsId = tabsId;
	}

	get container(): Locator {
		return this.frame.locator( `[data-id="${ this.tabsId }"]` );
	}

	get menu(): Locator {
		return this.container.locator( AtomicTabsSelectors.menu );
	}

	get contentArea(): Locator {
		return this.container.locator( AtomicTabsSelectors.contentArea );
	}

	getTab( index: number ): Locator {
		return this.container.locator( AtomicTabsSelectors.trigger ).nth( index );
	}

	getTabContent( index: number ): Locator {
		return this.contentArea.locator( AtomicTabsSelectors.content ).nth( index );
	}

	async getTabContentId( index: number ): Promise<string> {
		return await this.getTabContent( index ).getAttribute( 'data-id' );
	}

	async clickTab( index: number ): Promise<void> {
		await this.getTab( index ).click( { force: true } );
	}

	async expectTabActive( index: number ): Promise<void> {
		const tab = this.getTab( index );
		await expect( tab ).toHaveAttribute( 'aria-selected', 'true' );
		await expect( tab ).toHaveClass( new RegExp( AtomicTabsSelectors.selectedClass ) );
	}

	async expectTabInactive( index: number ): Promise<void> {
		const tab = this.getTab( index );
		await expect( tab ).toHaveAttribute( 'aria-selected', 'false' );
	}

	async expectTabCount( count: number ): Promise<void> {
		await expect( this.container.locator( AtomicTabsSelectors.trigger ) ).toHaveCount( count );
	}

	async expectVisible(): Promise<void> {
		await expect( this.container ).toBeVisible();
	}

	async expectMenuVisible(): Promise<void> {
		await expect( this.menu ).toBeVisible();
	}
}

export class AtomicTabsFrontend {
	private readonly page: Page;
	private readonly tabsId?: string;

	constructor( page: Page, tabsId?: string ) {
		this.page = page;
		this.tabsId = tabsId;
	}

	get container(): Locator {
		if ( this.tabsId ) {
			return this.page.locator( `[data-id="${ this.tabsId }"]` );
		}
		return this.page.locator( AtomicTabsSelectors.container ).first();
	}

	getTab( index: number ): Locator {
		return this.container.locator( AtomicTabsSelectors.trigger ).nth( index );
	}

	getAllTabs(): Locator {
		return this.container.locator( AtomicTabsSelectors.trigger );
	}

	async clickTab( index: number ): Promise<void> {
		await this.getTab( index ).click();
	}

	async focusTab( index: number ): Promise<void> {
		await this.getTab( index ).focus();
	}

	async expectTabActive( index: number ): Promise<void> {
		await expect( this.getTab( index ) ).toHaveAttribute( 'aria-selected', 'true' );
	}

	async expectTabInactive( index: number ): Promise<void> {
		await expect( this.getTab( index ) ).toHaveAttribute( 'aria-selected', 'false' );
	}

	async expectTabFocused( index: number ): Promise<void> {
		await expect( this.getTab( index ) ).toBeFocused();
	}

	async expectTabCount( count: number ): Promise<void> {
		await expect( this.getAllTabs() ).toHaveCount( count );
	}

	async pressKey( key: string ): Promise<void> {
		await this.page.keyboard.press( key );
	}
}

interface EditorWithAddElement {
	addElement: ( props: { elType: string }, containerId: string ) => Promise<string>;
}

export class AtomicTabsHelper {
	static async addTabsWidget( editor: EditorWithAddElement, containerId: string = 'document' ): Promise<string> {
		return await editor.addElement( { elType: 'e-tabs' }, containerId );
	}

	static createEditorWidget( frame: Frame, tabsId: string ): AtomicTabsWidget {
		return new AtomicTabsWidget( frame, tabsId );
	}

	static createFrontendWidget( page: Page, tabsId?: string ): AtomicTabsFrontend {
		return new AtomicTabsFrontend( page, tabsId );
	}
}

