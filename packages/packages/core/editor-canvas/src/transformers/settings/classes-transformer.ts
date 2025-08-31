import { stylesRepository } from '@elementor/editor-styles-repository';

import { createTransformer } from '../create-transformer';

export function createClassesTransformer() {
	return createTransformer( ( value: string[] ) => {
		return value
			.map( ( id ) => {
				return getCssName( id );
			} )
			.filter( Boolean );
	} );
}

function getCssName( id: string ) {
	const provider = stylesRepository.getProviders().find( ( p ) => {
		return p.actions.all().find( ( style ) => style.id === id );
	} );

	if ( ! provider ) {
		return id;
	}

	return provider.actions.resolveCssName( id );
}
