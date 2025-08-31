import { stylesRepository } from '@elementor/editor-styles-repository';

import { createTransformer } from '../create-transformer';

function transformClassId( id: string, cache: Map< string, string > ): string {
	if ( ! cache.has( id ) ) {
		const provider = stylesRepository.getProviders().find( ( p ) => {
			return p.actions.all().find( ( style ) => style.id === id );
		} );

		if ( ! provider ) {
			return id;
		}

		cache.set( id, provider.getKey() );
	}

	const providerKey = cache.get( id );

	if ( ! providerKey ) {
		return id;
	}

	const provider = stylesRepository.getProviderByKey( providerKey );

	return provider?.actions.resolveCssName( id ) || id;
}

export function createClassesTransformer() {
	const cache = new Map< string, string >();

	return createTransformer( ( value: string[] ) => {
		return value.map( ( id ) => transformClassId( id, cache ) ).filter( Boolean );
	} );
}
