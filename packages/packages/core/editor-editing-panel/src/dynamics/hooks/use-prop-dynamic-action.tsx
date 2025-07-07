import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { DatabaseIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type PopoverActionProps } from '../../popover-action';
import { DynamicSelection } from '../components/dynamic-selection';
import { supportsDynamic } from '../utils';

export const usePropDynamicAction = (): PopoverActionProps => {
	const { propType } = useBoundProp();

	const visible = !! propType && supportsDynamic( propType );

	return {
		visible,
		icon: DatabaseIcon,
		title: __( 'Dynamic tags', 'elementor' ),
		content: ( { close } ) => <DynamicSelection close={ close } />,
	};
};
