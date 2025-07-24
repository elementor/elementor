import { styleTransformersRegistry } from '@elementor/editor-canvas';
import { stylesInheritanceTransformersRegistry } from '@elementor/editor-editing-panel';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { TextIcon } from '@elementor/icons';

import { FontField } from './components/fields/font-field';
import { fontVariablePropTypeUtil } from './prop-types/font-variable-prop-type';
import { inheritanceTransformer } from './transformers/inheritance-transformer';
import { variableTransformer } from './transformers/variable-transformer';
import { registerVariable } from './variable-registry';

export function registerFontVariable() {
	registerVariable( {
		valueField: FontField,
		icon: TextIcon,
		propTypeUtil: fontVariablePropTypeUtil,
		fallbackPropTypeUtil: stringPropTypeUtil,
		variableType: 'font',
	} );

	styleTransformersRegistry.register( fontVariablePropTypeUtil.key, variableTransformer );
	stylesInheritanceTransformersRegistry.register( fontVariablePropTypeUtil.key, inheritanceTransformer );
}
