import { FIELD_TYPE, registerFieldIndicator } from '../field-indicators-registry';
import { StylesInheritanceIndicator } from './components/styles-inheritance-indicator';
import { initStylesInheritanceTransformers } from './init-styles-inheritance-transformers';

export const init = () => {
	initStylesInheritanceTransformers();

	registerFieldIndicator( {
		fieldType: FIELD_TYPE.STYLES,
		id: 'styles-inheritance',
		priority: 1,
		indicator: StylesInheritanceIndicator,
	} );
};
