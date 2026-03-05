export type ElementorErrorOptions = {
	cause?: Error[ 'cause' ];
	context?: Record< string, unknown > | null;
	code: string;
};

export class ElementorError extends Error {
	readonly context: ElementorErrorOptions[ 'context' ];
	readonly code: ElementorErrorOptions[ 'code' ];

	constructor( message: string, { code, context = null, cause = null }: ElementorErrorOptions ) {
		super( message, { cause } );
		this.context = context;
		this.code = code;
	}
}
