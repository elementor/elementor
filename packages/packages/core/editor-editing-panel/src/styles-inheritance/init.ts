import { registerFieldIndicator } from '../field-indicators-registry';
import { StylesInheritanceIndicator } from './components/styles-inheritance-indicator';
import { initStylesInheritanceTransformers } from './init-styles-inheritance-transformers';

export const init = () => {
	initStylesInheritanceTransformers();

	registerFieldIndicator( {
		fieldType: 'styles',
		priority: 1,
		indicator: {
			id: 'styles-inheritance',
			Adornment: StylesInheritanceIndicator,
		},
	} );
};
