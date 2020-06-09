import BaseStorage from './base-storage';

export default class LocalStorage extends BaseStorage {
	constructor() {
		super( localStorage );

		this.storage = new Map();
	}

	debug() {
		const entries = this.getAll(),
			ordered = {};

		Object.keys( this.getAll() ).sort().forEach( ( key ) => {
			ordered[ key ] = entries[ key ];
		} );

		return ordered;
	}
}
