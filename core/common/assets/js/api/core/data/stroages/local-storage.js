import BaseStorage from './base-storage';

export default class LocalStorage extends BaseStorage {
	constructor() {
		super( localStorage );
	}

	debug() {
		const entries = {};

		Object.entries( this.getAll() ).map( ( [ key, /*string*/ data ] ) => {
			entries[ key ] = JSON.parse( data );
		} );

		return entries;
	}
}
