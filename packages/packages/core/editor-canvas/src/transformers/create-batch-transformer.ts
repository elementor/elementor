import { type BatchHandlerCallback, batchProcess } from '../renderers/batch-process';
import { createTransformer } from '../transformers/create-transformer';

type TransformerArgs = Parameters< ReturnType< typeof createTransformer< unknown > > >;

export function createBatchTransformer< TPayload = unknown >( {
	handler,
	payload: getPayload,
}: {
	payload: ( ...args: TransformerArgs ) => TPayload;
	handler: BatchHandlerCallback< TPayload >;
} ) {
	const cache = new Map< string, unknown >();

	return createTransformer< unknown >( ( ...args: TransformerArgs ) => {
		const payload = getPayload( ...args );

		const id = createKey( payload );

		if ( cache.has( id ) ) {
			return cache.get( id );
		}

		return batchProcess( {
			id,
			handler,
			payload,
			onSuccess: ( result ) => {
				cache.set( id, result );
			},
			onError: ( error ) => {
				cache.set( id, null );
			},
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
