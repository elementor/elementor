import BaseStorage from './base-storage';

export default class LocalStorage extends BaseStorage {
	constructor() {
		super( localStorage );
	}

	custom() {
		console.log( 'custom' );
	}
}
