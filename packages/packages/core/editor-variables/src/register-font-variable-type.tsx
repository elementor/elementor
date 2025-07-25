import { styleTransformersRegistry } from '@elementor/editor-canvas';
import { registerControlReplacement, stylesInheritanceTransformersRegistry } from '@elementor/editor-editing-panel';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { TextIcon } from '@elementor/icons';

import { FontField } from './components/fields/font-field';
import { FontVariableControl } from './controls/font-variable-control';
import { fontVariablePropTypeUtil } from './prop-types/font-variable-prop-type';
import { inheritanceTransformer } from './transformers/inheritance-transformer';
import { variableTransformer } from './transformers/variable-transformer';
import { hasAssignedFontVariable } from './utils';
import { registerVariableType } from './variables-registry/variable-type-registry';

export function registerFontVariableType() {
	registerVariableType( {
		valueField: FontField,
		icon: TextIcon,
		propTypeUtil: fontVariablePropTypeUtil,
		fallbackPropTypeUtil: stringPropTypeUtil,
		variableType: 'font',
	} );

	registerControlReplacement( {
		component: FontVariableControl,
		condition: ( { value } ) => hasAssignedFontVariable( value ),
	} );

	styleTransformersRegistry.register( fontVariablePropTypeUtil.key, variableTransformer );
	stylesInheritanceTransformersRegistry.register( fontVariablePropTypeUtil.key, inheritanceTransformer );
}
