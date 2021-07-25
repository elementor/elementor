import Scheme from './scheme';

export default class HtmlScheme extends Scheme {
	/**
	 * @inheritDoc
	 */
	static parse( data ) {
		return ( new DOMParser ).parseFromString( data, this.mimeType );
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
		return 'text/html';
	}
}
