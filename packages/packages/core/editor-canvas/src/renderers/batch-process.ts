type Batch< TPayload, TResult extends HandlerResult = HandlerResult > = {
	$$batch: true;
	item: HandlerItem< TPayload, TResult >;
};

type HandlerItem< TPayload = unknown, TResult extends HandlerResult = HandlerResult > = {
	key: string;
	payload: TPayload;
	handler: BatchHandlerCallback< TPayload, TResult >;
};

export type HandlerResult = Array< { key: string; value: unknown } >;

type BatchHandlerCallbackContext = {
	signal?: AbortSignal;
};

export type BatchHandlerCallback< TPayload = unknown, TResult extends HandlerResult = HandlerResult > = (
	items: Array< HandlerItem< TPayload, TResult > >,
	context: BatchHandlerCallbackContext
) => Promise< HandlerResult > | HandlerResult;

export const batchProcess = < TPayload, TResult extends HandlerResult = HandlerResult >( {
	key,
	payload,
	handler,
}: {
	key: string;
	handler: BatchHandlerCallback< TPayload, TResult >;
	payload: TPayload;
} ): Batch< TPayload, TResult > => {
	return {
		$$batch: true,
		item: { key, payload, handler },
	};
};

export function isBatchProcess< TPayload, TResult extends HandlerResult = HandlerResult >(
	value: unknown
): value is Batch< TPayload, TResult > {
	return !! value && typeof value === 'object' && '$$batch' in value && value.$$batch === true;
}

export function createBatchManager() {
	const itemsByHandler = new Map< BatchHandlerCallback, Set< HandlerItem > >();

	return {
		add: ( item: HandlerItem ) => {
			if ( ! itemsByHandler.has( item.handler ) ) {
				itemsByHandler.set( item.handler, new Set() );
			}

			itemsByHandler.get( item.handler )?.add( item );
		},
		execute: async ( context: BatchHandlerCallbackContext ) => {
			const promises = itemsByHandler
				.entries()
				.map( ( [ handler, items ] ) => {
					return handler( items.values().toArray(), context );
				} )
				.toArray();

			const result = await Promise.all( promises );

			itemsByHandler.clear();

			return result.reduce< Record< string, unknown > >( ( acc, item ) => {
				item.forEach( ( { key, value } ) => {
					acc[ key ] = value;
				} );

				return acc;
			}, {} );
		},
	};
}
