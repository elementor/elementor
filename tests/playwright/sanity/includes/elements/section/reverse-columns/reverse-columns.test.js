const { test, expect } = require( '@playwright/test' );
const { EditorPage } = require( '../../../../../pages/editor-page' );
const Breakpoints = require( '../../../../../assets/breakpoints' );
const ReverseColumns = require( './reverse-columns' );

/**
 * Experiment Breakpoints(Off)
 */
for ( const testDevice of Breakpoints.getBasic() ) {
	if ( 'desktop' === testDevice ) {
		continue;
	}

	test( `Reverse columns:${ testDevice } - Experiment breakpoints:Off`, async ( { page } ) => {
		const reverseColumnDevice = testDevice;

		const editor = new EditorPage( page );

		await editor.init( {
			additional_custom_breakpoints: false,
		} );

		const reverseColumns = new ReverseColumns( page, editor );

		await reverseColumns.open();

		const firstColumn = await reverseColumns.getFirstColumn();

		await page.click( `#e-responsive-bar-switcher__option-${ reverseColumnDevice }` );
		await expect( firstColumn ).toHaveCSS( 'order', '0' );

		await reverseColumns.toggle( reverseColumnDevice );

		await expect( firstColumn ).toHaveCSS( 'order', '10' );

			const filteredBreakpoints = Breakpoints.getBasic().filter( ( value ) => reverseColumnDevice !== value );

		for ( const breakpoint of filteredBreakpoints ) {
			await page.click( `#e-responsive-bar-switcher__option-${ breakpoint }` );
			await expect( firstColumn ).toHaveCSS( 'order', '0' );
		}
	} );
}

test( 'Reverse columns:All - Experiment breakpoints:Off', async ( { page } ) => {
	const editor = new EditorPage( page );

    await editor.init( {
		additional_custom_breakpoints: false,
	} );

	const reverseColumns = new ReverseColumns( page, editor );

	await reverseColumns.open();

	const firstColumn = await reverseColumns.getFirstColumn();

	await reverseColumns.toggle( 'mobile' );
	await reverseColumns.toggle( 'tablet' );

	await page.click( '#e-responsive-bar-switcher__option-mobile' );
	await expect( firstColumn ).toHaveCSS( 'order', '10' );

	await page.click( '#e-responsive-bar-switcher__option-tablet' );
	await expect( firstColumn ).toHaveCSS( 'order', '10' );

	await page.click( '#e-responsive-bar-switcher__option-desktop' );
	await expect( firstColumn ).toHaveCSS( 'order', '0' );
} );

/**
 * Experiment Breakpoints(On)
 */
for ( const testDevice of Breakpoints.getAll() ) {
	if ( 'desktop' === testDevice ) {
		continue;
	}

	test( `Reverse columns:${ testDevice } - Experiment breakpoints:On`, async ( { page } ) => {
		const reverseColumnDevice = testDevice;

		const editor = new EditorPage( page );

		await editor.init( {
			additional_custom_breakpoints: true,
		} );

		const breakpoints = new Breakpoints( page, editor );

		await breakpoints.addAllBreakpoints();

		const reverseColumns = new ReverseColumns( page, editor );

		await reverseColumns.open();

		const firstColumn = await reverseColumns.getFirstColumn();

		await page.click( `#e-responsive-bar-switcher__option-${ reverseColumnDevice }` );
		await expect( firstColumn ).toHaveCSS( 'order', '0' );

		await reverseColumns.toggle( reverseColumnDevice );

		await expect( firstColumn ).toHaveCSS( 'order', '10' );

		const filteredBreakpoints = Breakpoints.getAll().filter( ( value ) => reverseColumnDevice !== value );

		for ( const breakpoint of filteredBreakpoints ) {
			await page.click( `#e-responsive-bar-switcher__option-${ breakpoint }` );
			await expect( firstColumn ).toHaveCSS( 'order', '0' );
		}
	} );
}

test( 'Reverse columns:All - Experiment breakpoints:On', async ( { page } ) => {
	const editor = new EditorPage( page );

    await editor.init( {
		additional_custom_breakpoints: true,
	} );

	const breakpoints = new Breakpoints( page, editor );

	await breakpoints.addAllBreakpoints();

	const reverseColumns = new ReverseColumns( page, editor );

	await reverseColumns.open();

	const firstColumn = await reverseColumns.getFirstColumn();

	for ( const breakpoint of Breakpoints.getAll() ) {
		await page.click( `#e-responsive-bar-switcher__option-${ breakpoint }` );
		if ( 'desktop' === breakpoint ) {
			await expect( firstColumn ).toHaveCSS( 'order', '0' );
			continue;
		}
		await reverseColumns.toggle( breakpoint );
		await expect( firstColumn ).toHaveCSS( 'order', '10' );
    }
} );

