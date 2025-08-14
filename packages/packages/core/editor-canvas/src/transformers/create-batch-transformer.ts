import { type BatchHandlerCallback, batchProcess, type HandlerResult } from '../renderers/batch-process';
import { createTransformer } from '../transformers/create-transformer';

type TransformerArgs = Parameters< ReturnType< typeof createTransformer< unknown > > >;

export function createBatchTransformer< TPayload, TResult extends HandlerResult = HandlerResult >( {
	handler,
	payload: getPayload,
}: {
	payload: ( ...args: TransformerArgs ) => TPayload;
	handler: BatchHandlerCallback< TPayload, TResult >;
} ) {
	const cache = new Map< string, TResult >();

	return createTransformer< unknown >( ( ...args: TransformerArgs ) => {
		const payload = getPayload( ...args );

		const key = createKey( payload );

		if ( cache.has( key ) ) {
			return cache.get( key );
		}

		return batchProcess( {
			key,
			handler,
			payload,
		} );
	} );
}

function createKey( payload: unknown ): string {
	if ( typeof payload === 'string' ) {
		return payload;
	}

	return toBase64Unicode( JSON.stringify( payload ) );
}

function toBase64Unicode( str: string ) {
	return btoa( String.fromCharCode( ...new TextEncoder().encode( str ) ) );
}
