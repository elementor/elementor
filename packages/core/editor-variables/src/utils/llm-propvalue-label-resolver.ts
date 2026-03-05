import { service } from '../service';

const defaultResolver = ( key: string ) => ( value: unknown ) => {
	const idOrLabel = String( value );
	return {
		$$type: key,
		value: service.variables()[ idOrLabel ] ? idOrLabel : service.findIdByLabel( idOrLabel ),
	};
};

export const globalVariablesLLMResolvers = {
	'global-color-variable': defaultResolver( 'global-color-variable' ),
	'global-font-variable': defaultResolver( 'global-font-variable' ),
	'global-size-variable': defaultResolver( 'global-size-variable' ),
};
