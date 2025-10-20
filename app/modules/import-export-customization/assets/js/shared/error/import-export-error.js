export class ImportExportError extends Error {
    constructor( errorMessage, errorCode ) {
        super( typeof errorMessage === 'string' ? errorMessage : '' );
        this.code = errorCode || 'general';
        this.details = errorMessage; // preserve original (object or string)
    }
}
