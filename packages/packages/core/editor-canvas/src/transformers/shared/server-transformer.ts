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
			const {
				data: { data },
			} = await httpService().post< Record< string, unknown > >(
				URI,
				{
					context,
					props: items.map( ( item ) => ( { key: item.id, value: item.payload } ) ),
				},
				{ signal }
			);

			const result = z
				.object( {
					props: z.record( z.string(), z.unknown() ),
				} )
				.parse( data );

			return Object.fromEntries( 
				items.map( ( { id } ) => [ id, result.props[ id ] ?? null ] ) 
			);
		},
	} );
}
