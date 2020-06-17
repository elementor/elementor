import BasePrefixStorage from './base-prefix-storage';

export default class LocalStorage extends BasePrefixStorage {
	constructor() {
		super( localStorage );
	}

	debug() {
		const entries = this.getAll(),
			ordered = {};

		Object.keys( entries ).sort().forEach( ( key ) => {
			const value = entries[ key ];

			ordered[ key ] = value;
		} );

		return ordered;
	}
}
