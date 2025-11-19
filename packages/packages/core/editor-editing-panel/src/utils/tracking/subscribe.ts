import { stylesRepository } from '@elementor/editor-styles-repository';

export const trackStyles = ( provider: string, event: string, data: Record< string, unknown > ) => {
	const providerInstance = stylesRepository.getProviderByKey( provider );

	if ( ! providerInstance ) {
		console.log( `LOG::❌ ${ provider }:${ event }:: ${ data?.location ?? 'no location' }` );
	} else {
		console.log( `LOG::✅ ${ provider }:${ event }:: ${ data?.location ?? 'no location' }` );
		providerInstance?.actions.tracking( { event, ...data } );
	}
};
