import apiFetch from '@wordpress/api-fetch';

type User = {
	capabilities: Record< string, boolean >;
};

export const getUser = () => {
	const baseUri = '/wp/v2/users/me';

	const keys: Array< keyof User > = [ 'capabilities' ];

	const queryParams = new URLSearchParams( {
		_fields: keys.join( ',' ),
		context: 'edit',
	} );

	const uri = baseUri + '?' + queryParams.toString();

	return apiFetch< User >( { path: uri } );
};
