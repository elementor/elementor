import { ensureError } from "@elementor/utils";

type Batch< TPayload = unknown > = {
	$$batch: true;
	value: BatchValue< TPayload >;
};

type BatchValue< TPayload = unknown > = {
	id: string;
	payload: TPayload;
	handler: BatchHandlerCallback< TPayload >;
	onSuccess?: ( result: unknown ) => void;
	onError?: ( error: Error ) => void;
};

type HandlerItem< TPayload = unknown> = {
	key: string;
	id: string;
	payload: TPayload;
	onSuccess?: ( result: unknown ) => void;
	onError?: ( error: Error ) => void;
};

type HandlerCallbackItem< TPayload = unknown> = {
	key: string;
	id: string;
	payload: TPayload;
};

export type HandlerResult = Record< HandlerItem['id'], unknown >;

type BatchHandlerCallbackContext = {
	signal?: AbortSignal;
};

export type BatchHandlerCallback< TPayload = unknown> = (
	items: Array< HandlerCallbackItem< TPayload > >,
	context: BatchHandlerCallbackContext
) => Promise< HandlerResult > | HandlerResult;

export const batchProcess = < TPayload = unknown >( {
	id,
	payload,
	handler,
	onSuccess,
	onError,
}: BatchValue<TPayload> ): Batch< TPayload > => {
	return {
		$$batch: true,
		value: { id, payload, handler, onSuccess, onError },
	};
};

export function isBatchProcess< TPayload = unknown >( value: unknown ): value is Batch< TPayload > {
	return !! value && typeof value === 'object' && '$$batch' in value && value.$$batch === true;
}

export function createBatchManager() {
	const itemsByHandler = new Map< BatchHandlerCallback, Set< HandlerItem > >();

	return {
		add: ( key: string, item: BatchValue ) => {
			if ( ! itemsByHandler.has( item.handler ) ) {
				itemsByHandler.set( item.handler, new Set() );
			}

			itemsByHandler.get( item.handler )?.add( {
				key,
				id: item.id,
				payload: item.payload,
				onSuccess: item.onSuccess,
				onError: item.onError,
			} );
		},
		execute: async ( context: BatchHandlerCallbackContext ) => {
			const promises = itemsByHandler
				.entries()
				.map( async ( [ handler, items ] ) => {
					try {
						const results = await handler(
							Array.from( items ).map( ( item ) => ( {
								key: item.key,
								id: item.id,
								payload: item.payload,
							} ) ),
							context
						);

						items.forEach( ( item ) => {
							item.onSuccess?.( results[ item.id ] );
						} );

						return [ ...items ].map( ( item ) => ({
							[ item.key ]: results[ item.id ],
						}) );
					} catch ( error ) {
						items.forEach( ( item ) => {
							item.onError?.( ensureError( error ) );
						} );

						return [ ...items ].map( ( item ) => ({
							[ item.key ]: null,
						}) );
					}
				} )
				.toArray();

			const results = await Promise.all( promises );

			itemsByHandler.clear();

			return results.flat();
		},
	};
}
