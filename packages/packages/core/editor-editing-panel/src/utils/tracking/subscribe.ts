import { stylesRepository } from '@elementor/editor-styles-repository';
const GLOBAL_CLASSES_PROVIDER_KEY = 'global-classes';

export const trackGlobalClasses = ( ...rest: any ) => {
	const globalClassesProvider = stylesRepository.getProviderByKey( GLOBAL_CLASSES_PROVIDER_KEY );

	if ( globalClassesProvider?.actions.tracking ) {
		const [ event, ...restData ] = rest;
		return globalClassesProvider?.actions.tracking( event, { ...restData } );
	}
};
