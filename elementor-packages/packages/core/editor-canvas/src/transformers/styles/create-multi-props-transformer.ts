import { createMultiPropsValue } from '../../renderers/multi-props';
import { createTransformer } from '../create-transformer';

type KeyGenerator = ( { propKey, key }: { propKey: string; key: string } ) => string;

export const createMultiPropsTransformer = ( keys: string[], keyGenerator: KeyGenerator ) => {
	return createTransformer< Record< string, string > >( ( value, { key: propKey } ) => {
		const entries = keys
			.filter( ( key ) => value[ key ] )
			.map( ( key ) => [ keyGenerator( { propKey, key } ), value[ key ] ] );

		return createMultiPropsValue( Object.fromEntries( entries ) );
	} );
};
