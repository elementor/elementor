export const getUpdateUrl = ( id: number ) => {
	const url = new URL( window.location.href );

	url.searchParams.set( 'post', id.toString() );
	url.searchParams.delete( 'active-document' );
	return url;
};
