module.exports = async function( page ) {
	page.on( 'response', ( response ) => {
        if ( response.status() !== 200 ) {
		console.log( 'HTTP ERROR : ', response.status(), response.url() );
        }
    } );
};
