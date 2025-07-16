import * as React from 'react';
import { type PopoverActionProps, useBoundProp } from '@elementor/editor-editing-panel';
import { ColorFilterIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { VariableSelectionPopover } from '../components/variable-selection-popover';
import { sizeVariablePropTypeUtil } from '../prop-types/size-variable-prop-type';
import { supportsSizeVariables } from '../utils';

export const usePropSizeVariableAction = (): PopoverActionProps => {
	const { propType } = useBoundProp();

	const visible = !! propType && supportsSizeVariables( propType );

	return {
		visible,
		icon: ColorFilterIcon,
		title: __( 'Variables', 'elementor' ),
		content: ( { close: closePopover } ) => {
			return (
				<VariableSelectionPopover closePopover={ closePopover } propTypeKey={ sizeVariablePropTypeUtil.key } />
			);
		},
	};
};
