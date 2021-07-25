export default class MimeTypeValidator {
	/**
	 * MimeTypeValidator constructor.
	 *
	 * @param mimeTypes
	 */
	constructor( mimeTypes ) {
		this.setPattern( mimeTypes );
	}

	/**
	 * Set a regex pattern that can be used to validate whether a mime-type belongs to the ones given here.
	 * When '*' is used inside one of the mime-types, it's replaced with a suitable regex expression so a wide
	 * variety of mime-types can be matched.
	 *
	 * @param mimeTypes
	 */
	setPattern( mimeTypes ) {
		mimeTypes = Array.isArray( mimeTypes ) ? mimeTypes : [ mimeTypes ];

		this.pattern = new RegExp(
			mimeTypes.join( '|' )
				.replace( '/', '\\/' )
				.replace( '*', '\\w+' ),
			'i'
		);
	}

	/**
	 * Validate that a media-type is compatible with the media-types this validator's pattern represents.
	 *
	 * @param mimeType
	 * @returns {boolean}
	 */
	validate( mimeType ) {
		return this.pattern.test( mimeType );
	}
}
