import { ElementorError, type ElementorErrorOptions } from './elementor-error';

export type CreateErrorParams = {
	code: ElementorErrorOptions[ 'code' ];
	message: string;
};

export const createError = < T extends ElementorErrorOptions[ 'context' ] >( { code, message }: CreateErrorParams ) => {
	return class extends ElementorError {
		constructor( { cause, context }: { cause?: ElementorErrorOptions[ 'cause' ]; context?: T } = {} ) {
			super( message, { cause, code, context } );
		}
	};
};
