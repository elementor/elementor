import * as React from 'react';
import { EyeIcon, EyeOffIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';

export const DisableItemAction = () => {
	const {
		config: {
			itemActions: { inject },
		},
	} = useRepeaterContext();

	inject( Action, 'disable' );

	return null;
};

const Action = ( { index }: { index: number } ) => {
	const { items, setItems } = useRepeaterContext();
	const propDisabled = items[ index ]?.disabled ?? false;

	const toggleLabel = propDisabled ? __( 'Show', 'elementor' ) : __( 'Hide', 'elementor' );

	const onClick = () => {
		const newItems = [ ...items ];

		const self = newItems[ index ];

		if ( ! self ) {
			return;
		}

		self.disabled = ! self.disabled;

		if ( ! self.disabled ) {
			delete self.disabled;
		}

		newItems.splice( index, 1, self );
		setItems( newItems );
	};

	return (
		<Tooltip title={ toggleLabel } placement="top">
			<IconButton size={ SIZE } onClick={ onClick } aria-label={ toggleLabel }>
				{ propDisabled ? <EyeOffIcon fontSize={ SIZE } /> : <EyeIcon fontSize={ SIZE } /> }
			</IconButton>
		</Tooltip>
	);
};
