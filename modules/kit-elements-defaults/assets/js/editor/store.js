export default {
	items: {},

	get( type ) {
		return this.items[ type ] || {};
	},

	async load() {
		this.items = await apiRequest( 'GET', '/' );
	},

	async upsert( type, settings ) {
		await apiRequest( 'PUT', `/${ type }`, { settings } );

		await this.load();
	},

	async delete( type ) {
		await apiRequest( 'DELETE', `/${ type }` );

		await this.load();
	},
};

async function apiRequest( method, endpoint, data = {} ) {
	const headers = {
		'Content-Type': 'application/json',
		'X-WP-Nonce': wpApiSettings.nonce,
	};

	const BASE_URL = wpApiSettings.root + 'elementor/v1/kit-elements-defaults';

	const options = {
		method,
		headers,
	};

	if ( ! [ 'GET', 'HEAD' ].includes( method ) ) {
		options.body = JSON.stringify( data );
	}

	const res = await fetch( BASE_URL + endpoint, options );

	if ( ! res.ok ) {
		return Promise.reject( res );
	}

	const body = await res.text();

	return body ? JSON.parse( body ) : {};
}
