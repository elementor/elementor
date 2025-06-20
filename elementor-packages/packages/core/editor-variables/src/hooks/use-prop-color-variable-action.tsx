import * as React from 'react';
import { type PopoverActionProps, useBoundProp } from '@elementor/editor-editing-panel';
import { ColorFilterIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { VariableSelectionPopover } from '../components/variable-selection-popover';
import { colorVariablePropTypeUtil } from '../prop-types/color-variable-prop-type';
import { supportsColorVariables } from '../utils';

export const usePropColorVariableAction = (): PopoverActionProps => {
	const { propType } = useBoundProp();

	const visible = !! propType && supportsColorVariables( propType );

	return {
		visible,
		icon: ColorFilterIcon,
		title: __( 'Variables', 'elementor' ),
		content: ( { close: closePopover } ) => {
			return (
				<VariableSelectionPopover closePopover={ closePopover } propTypeKey={ colorVariablePropTypeUtil.key } />
			);
		},
	};
};
