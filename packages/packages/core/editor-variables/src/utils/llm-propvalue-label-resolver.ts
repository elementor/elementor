import { service } from '../service';

export const globalVariablesLLMResolvers = {
	'global-color-variable': ( value: unknown ) => {
		const idOrLabel = String( value );
		return {
			$$type: 'global-color-variable',
			value: service.variables()[ idOrLabel ] ? idOrLabel : service.findIdByLabel( idOrLabel ),
		};
	},
};
