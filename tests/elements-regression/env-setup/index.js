const actions = require( './actions/index' );

const runActions = async ( name, { browser } ) => {
	const context = await browser.newContext();
	const page = await context.newPage();

	for ( const action of actions ) {
		if ( action?.[ name ] ) {
			await action[ name ]( { page, context, browser } );
		}
	}

	context.close();
};

module.exports = {
	beforeAll: async ( { browser } ) => {
		await runActions( 'beforeAll', { browser } );
	},
	afterAll: async ( { browser } ) => {
		await runActions( 'afterAll', { browser } );
	},
};
