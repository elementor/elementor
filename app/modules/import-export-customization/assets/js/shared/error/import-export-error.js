export class ImportExportError extends Error {
	constructor( errorMessage, errorCode ) {
		super( errorMessage );
		this.code = errorCode || 'general';
	}
}
