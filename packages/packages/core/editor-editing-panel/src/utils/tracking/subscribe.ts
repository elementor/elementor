import { stylesRepository } from '@elementor/editor-styles-repository';

export const trackStyles = ( provider: string, event: string, data: Record< string, unknown > ) => {
	const providerInstance = stylesRepository.getProviderByKey( provider );

	providerInstance?.actions.tracking?.( { event, ...data } );
};
