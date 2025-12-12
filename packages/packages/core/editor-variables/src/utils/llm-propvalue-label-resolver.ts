import { service } from '../service';

export const globalVariablesLLMResolvers = {
	'global-color-variable': ( value: unknown ) => {
		const idOrLabel = String( value );
		return {
			$$type: 'global-color-variable',
			value: service.variables()[ idOrLabel ] ? idOrLabel : service.findIdByLabel( idOrLabel ),
		};
	},
	'global-font-variable': ( value: unknown ) => {
		const idOrLabel = String( value );
		return {
			$$type: 'global-font-variable',
			value: service.variables()[ idOrLabel ] ? idOrLabel : service.findIdByLabel( idOrLabel ),
		};
	},
	'global-size-variable': ( value: unknown ) => {
		const idOrLabel = String( value );
		return {
			$$type: 'global-size-variable',
			value: service.variables()[ idOrLabel ] ? idOrLabel : service.findIdByLabel( idOrLabel ),
		};
	},
};
