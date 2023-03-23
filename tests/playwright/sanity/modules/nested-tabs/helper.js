
export async function editTab( editor, tabIndex ) {
	const tabTitleSelector = '.e-n-tabs-heading .e-n-tab-title';
	await editor.getPreviewFrame().waitForSelector( `${ tabTitleSelector }.e-active` );
	const tabTitle = await editor.getPreviewFrame().locator( `${ tabTitleSelector }>>nth=${ tabIndex }` );
	await tabTitle.click();
	await editor.page.waitForTimeout( 100 );
	return await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active.elementor-element-edit-mode' ).getAttribute( 'data-id' );
}

// Click on tab by position.
export async function clickTab( context, tabPosition ) {
	await context.locator( `.elementor-widget-n-tabs .e-n-tab-title >> nth=${ tabPosition } ` ).first().click();
}

// Click on tab by position.
export async function clickMobileTab( context, tabPosition ) {
	await context.locator( `.elementor-widget-n-tabs .e-collapse >> nth=${ tabPosition } ` ).first().click();
}

export async function setup( wpAdmin, customExperiment = '' ) {
	let experiments = {
		container: 'active',
		'nested-elements': 'active',
	};

	experiments = { ...experiments, ...customExperiment };
	await wpAdmin.setExperiments( experiments );
}

export async function cleanup( wpAdmin, customExperiment = '' ) {
	let experiments = {
		container: 'inactive',
		'nested-elements': 'inactive',
	};

	experiments = { ...experiments, ...customExperiment };
	await wpAdmin.setExperiments( experiments );
}

export async function setTabItemColor( page, editor, panelClass, tabState, colorPickerClass, color ) {
	await editor.activatePanelTab( 'style' );
	if ( 'tabs' !== panelClass ) {
		await page.locator( `.elementor-control-${ panelClass }` ).click();
	}
	await page.locator( `.elementor-control-${ tabState }` ).click();
	await page.locator( `.elementor-control-${ colorPickerClass } .pcr-button` ).click();
	await page.fill( '.pcr-app.visible .pcr-interaction input.pcr-result', color );
}

export async function setTabBorderColor( page, editor, state, stateExtended, color, borderWidth, borderStyle = 'solid' ) {
	await editor.activatePanelTab( 'style' );
	await page.locator( `.elementor-control-section_tabs_style` ).click();
	await page.locator( `.elementor-control-tabs_title_${ state }` ).click();
	await page.selectOption( `.elementor-control-tabs_title_border${ stateExtended }_border >> select`, borderStyle );
	await page.locator( `.elementor-control-tabs_title_border${ stateExtended }_width .elementor-control-input-wrapper input` ).first().fill( borderWidth );
	await page.locator( `.elementor-control-tabs_title_border${ stateExtended }_color .pcr-button` ).click();
	await page.fill( '.pcr-app.visible .pcr-interaction input.pcr-result', color );
}

export async function getDropdownContainerId( editor, widgetId, itemNumber = 1 ) {
	const widgetSelector = `.elementor-widget.elementor-element-${ widgetId }`;
	await editor.getPreviewFrame().waitForSelector( `${ widgetSelector }.elementor-element-editable` );
	await editor.getPreviewFrame().locator( `${ widgetSelector } .e-n-tab-title.e-normal:nth-child(${ itemNumber })` ).click();
	return await editor.getPreviewFrame().locator( `${ widgetSelector } .e-con.e-active` ).getAttribute( 'data-id' );
}

export async function selectDropdownContainer( editor, widgetId, itemNumber = 0 ) {
	const isActiveTab = await editor.getPreviewFrame().locator( `.e-normal >> nth=${ itemNumber }` ).evaluate( ( element ) => element.classList.contains( 'e-active ' ) );

	if ( ! isActiveTab ) {
		await clickTab( editor.getPreviewFrame(), itemNumber );
	}

	await editor.getPreviewFrame().locator( '.e-con.e-active' ).hover();
	const elementEditButton = editor.getPreviewFrame().locator( '.e-con.e-active > .elementor-element-overlay > .elementor-editor-element-settings > .elementor-editor-element-edit' );
	await elementEditButton.click();
	await editor.getPreviewFrame().waitForSelector( '.e-con.e-active.elementor-element-editable' );
}
