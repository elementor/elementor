import * as React from 'react';
import { colorPropTypeUtil, sizePropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { CtaButton } from '@elementor/editor-ui';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { BrushIcon, ExpandDiagonalIcon, ResetIcon, TextIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { ColorField } from './components/fields/color-field';
import { FontField } from './components/fields/font-field';
import { ColorIndicator } from './components/ui/color-indicator';
import { colorVariablePropTypeUtil } from './prop-types/color-variable-prop-type';
import { fontVariablePropTypeUtil } from './prop-types/font-variable-prop-type';
import { sizeVariablePropTypeUtil } from './prop-types/size-variable-prop-type';
import { EmptyTransformer } from './transformers/empty-transformer';
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
		menuActionsFactory: ( { variable, variableId, handlers } ) => {
			const actions = [];

			if ( ! isExperimentActive( 'e_design_system_sync' ) ) {
				return [];
			}

			if ( variable.sync_to_v3 ) {
				actions.push( {
					name: __( 'Stop syncing to Version 3', 'elementor' ),
					icon: ResetIcon,
					color: 'text.primary',
					onClick: () => handlers.onStopSync( variableId ),
				} );
			} else {
				actions.push( {
					name: __( 'Sync to Version 3', 'elementor' ),
					icon: ResetIcon,
					color: 'text.primary',
					onClick: () => handlers.onStartSync( variableId ),
				} );
			}

			return actions;
		},
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

	const sizePromotions = {
		isActive: false,
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
}
