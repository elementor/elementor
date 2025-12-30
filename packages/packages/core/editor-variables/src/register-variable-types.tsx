import * as React from 'react';
import { colorPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { BrushIcon, TextIcon } from '@elementor/icons';

import { ColorField } from './components/fields/color-field';
import { FontField } from './components/fields/font-field';
import { ColorIndicator } from './components/ui/color-indicator';
import { colorVariablePropTypeUtil } from './prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from './prop-types/font-variable-prop-type';
import { registerVariableType } from './variables-registry/variable-type-registry';

export function registerVariableTypes() {
	registerVariableType( {
		valueField: ColorField,
		icon: BrushIcon,
		propTypeUtil: colorVariablePropTypeUtil,
		fallbackPropTypeUtil: colorPropTypeUtil,
		variableType: 'color',
		startIcon: ( { value } ) => <ColorIndicator size="inherit" component="span" value={ value } />,
		defaultValue: '#ffffff',
	} );

	registerVariableType( {
		valueField: FontField,
		icon: TextIcon,
		propTypeUtil: fontVariablePropTypeUtil,
		fallbackPropTypeUtil: stringPropTypeUtil,
		variableType: 'font',
		defaultValue: 'Roboto',
	} );
<<<<<<< HEAD
=======

	const sizePromotions = {
		icon: ExpandDiagonalIcon,
		propTypeUtil: sizeVariablePropTypeUtil,
		fallbackPropTypeUtil: sizePropTypeUtil,
		styleTransformer: EmptyTransformer,
		variableType: 'size',
		selectionFilter: () => [],
		emptyState: <CtaButton size="small" href={ 'https://go.elementor.com/go-pro-panel-size-variable/' } />,
	};

	registerVariableType( {
		...sizePromotions,
		key: sizeVariablePropTypeUtil.key,
		defaultValue: '0px',
	} );

	registerVariableType( {
		...sizePromotions,
		key: 'global-custom-size-variable',
	} );
>>>>>>> a9f120717e (Internal: Add Size variable to Variables Manager create menu [ED-21168] (#34022))
}
