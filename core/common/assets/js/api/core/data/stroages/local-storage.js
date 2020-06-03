import BaseStorage from './base-storage';

export default class LocalStorage extends BaseStorage {
	constructor() {
		super( localStorage );

		this.clear();
	}

	debug() {
		const entries = {},
			ordered = {};

		Object.entries( this.getAll() ).map( ( [ key, /*string*/ data ] ) => {
			entries[ key ] = JSON.parse( data );
		} );

		Object.keys( entries ).sort().forEach( ( key ) =>  {
			ordered[ key ] = entries[ key ];
		} );

		return ordered;
	}
}
