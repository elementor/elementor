const { test } = require( '@playwright/test' );
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
		const reverseColumns = new ReverseColumns( page );
		await reverseColumns.testReverseColumnsOneActivated( testDevice );
	} );
}

test( 'Reverse columns:All - Experiment breakpoints:Off', async ( { page } ) => {
	const reverseColumns = new ReverseColumns( page );
	await reverseColumns.testReverseColumnsAllActivated();
} );

/**
 * Experiment Breakpoints(On)
 */
for ( const testDevice of Breakpoints.getAll() ) {
	if ( 'desktop' === testDevice ) {
		continue;
	}

	test( `Reverse columns:${ testDevice } - Experiment breakpoints:On`, async ( { page } ) => {
		const reverseColumns = new ReverseColumns( page );
		await reverseColumns.testReverseColumnsOneActivated( testDevice, true );
	} );
}

test( 'Reverse columns:All - Experiment breakpoints:On', async ( { page } ) => {
	const reverseColumns = new ReverseColumns( page );
	await reverseColumns.testReverseColumnsAllActivated( true );
} );

