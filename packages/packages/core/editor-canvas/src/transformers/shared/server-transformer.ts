import { httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';

import { createBatchTransformer } from '../create-batch-transformer';

const URI = '/elementor/v1/resolve-props';

type Options = {
	context: 'settings' | 'styles';
};

export function createServerTransformer( { context }: Options ) {
	return createBatchTransformer( {
		payload: ( value, { $$type, key, meta } ) => ( {
			key,
			value: { $$type, value },
			elementType: typeof meta.elementType === 'string' ? meta.elementType : null,
		} ),
		handler: async ( items, { signal } ) => {
			try {
				const {
					data: { data },
				} = await httpService().post< Record< string, unknown > >(
					URI,
					{
						context,
						props: items.map( ( item ) => ( { key: item.key, value: item.payload } ) ),
					},
					{ signal }
				);

				const result = z
					.object( {
						props: z.record( z.string(), z.unknown() ),
					} )
					.parse( data );

				return items.map( ( item ) => ( {
					key: item.payload.key,
					value: result.props[ item.key ] ?? null,
				} ) );
			} catch {
				return items.map( ( item ) => ( {
					key: item.payload.key,
					value: null,
				} ) );
			}
		},
	} );
}
