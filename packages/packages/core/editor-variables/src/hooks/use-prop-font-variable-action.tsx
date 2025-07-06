import * as React from 'react';
import { type PopoverActionProps, useBoundProp } from '@elementor/editor-editing-panel';
import { ColorFilterIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { VariableSelectionPopover } from '../components/variable-selection-popover';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';
import { supportsFontVariables } from '../utils';

export const usePropFontVariableAction = (): PopoverActionProps => {
	const { propType } = useBoundProp();

	const visible = !! propType && supportsFontVariables( propType );

	return {
		visible,
		icon: ColorFilterIcon,
		title: __( 'Variables', 'elementor' ),
		content: ( { close: closePopover } ) => {
			return (
				<VariableSelectionPopover closePopover={ closePopover } propTypeKey={ fontVariablePropTypeUtil.key } />
			);
		},
	};
};
