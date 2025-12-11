import * as React from 'react';
import { colorPropTypeUtil, sizePropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { UpgradeButton } from '@elementor/editor-ui';
import { BrushIcon, ExpandDiagonalIcon, TextIcon } from '@elementor/icons';

import { ColorField } from './components/fields/color-field';
import { FontField } from './components/fields/font-field';
import { ColorIndicator } from './components/ui/color-indicator';
import { colorVariablePropTypeUtil } from './prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from './prop-types/font-variable-prop-type';
import { sizeVariablePropTypeUtil } from './prop-types/size-variable-prop-type';
import { registerVariableType } from './variables-registry/variable-type-registry';

export function registerVariableTypes() {
	registerVariableType( {
		key: colorVariablePropTypeUtil.key,
		valueField: ColorField,
		icon: BrushIcon,
		propTypeUtil: colorVariablePropTypeUtil,
		fallbackPropTypeUtil: colorPropTypeUtil,
		variableType: 'color',
		startIcon: ( { value } ) => <ColorIndicator size="inherit" component="span" value={ value } />,
		defaultValue: '#ffffff',
	} );

	registerVariableType( {
		key: fontVariablePropTypeUtil.key,
		valueField: FontField,
		icon: TextIcon,
		propTypeUtil: fontVariablePropTypeUtil,
		fallbackPropTypeUtil: stringPropTypeUtil,
		variableType: 'font',
		defaultValue: 'Roboto',
	} );

	registerVariableType( {
		key: sizeVariablePropTypeUtil.key,
		icon: ExpandDiagonalIcon,
		propTypeUtil: sizeVariablePropTypeUtil,
		fallbackPropTypeUtil: sizePropTypeUtil,
		variableType: 'size',
		emptyState: <UpgradeButton size="small" href={ 'https://go.elementor.com/go-pro-panel-size-variable/' } />,
	} );
}
