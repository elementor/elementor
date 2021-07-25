import Scheme from './scheme';

export default class JsonScheme extends Scheme {
	/**
	 * @inheritDoc
	 */
	static parse( data ) {
		return JSON.parse( data );
	}

	/**
	 * @inheritDoc
	 */
	static validate( data ) {
		try {
			this.parse( data );
			return true;
		} catch ( e ) {
			return false;
		}
	}

	/**
	 * @inheritDoc
	 */
	static get mimeType() {
		return 'application/json';
	}
}
