export class ImportExportError extends Error {
	constructor( errorMessage, errorCode ) {
		super( 'string' === typeof errorMessage ? errorMessage : '' );
		this.code = errorCode || 'general';
		this.details = errorMessage;
	}
}
