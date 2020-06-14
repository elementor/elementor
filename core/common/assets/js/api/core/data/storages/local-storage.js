import PrefixStorage from './prefix-storage';

export default class LocalStorage extends PrefixStorage {
	constructor() {
		super( localStorage );
	}

	debug() {
<<<<<<< HEAD:core/common/assets/js/api/core/data/stroages/local-storage.js
		const entries = {},
=======
		const entries = this.getAll(),
>>>>>>> 3ac6a35... TMP:core/common/assets/js/api/core/data/storages/local-storage.js
			ordered = {};

		Object.keys( entries ).sort().forEach( ( key ) => {
			const value = entries[ key ];

			ordered[ key ] = value;
		} );

<<<<<<< HEAD:core/common/assets/js/api/core/data/stroages/local-storage.js
		Object.keys( entries ).sort().forEach( ( key ) => {
			ordered[ key ] = entries[ key ];
		} );

=======
>>>>>>> 3ac6a35... TMP:core/common/assets/js/api/core/data/storages/local-storage.js
		return ordered;
	}
}
