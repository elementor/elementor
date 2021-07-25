export default class Scheme {
	/**
	 * Parse scheme data to an object.
	 *
	 * @abstract
	 * @param data
	 */
	static parse( data ) {}
	/**
	 * Validate that data is represented bt the scheme.
	 *
	 * @abstract
	 * @param data
	 */
	static validate( data ) {}

	/**
	 * Get the scheme meme-type.
	 *
	 * @abstract
	 * @returns {string}
	 */
	static get mimeType() {}
}
