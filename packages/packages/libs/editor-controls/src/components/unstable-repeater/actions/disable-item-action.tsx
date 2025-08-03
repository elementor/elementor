import * as React from 'react';
import { EyeIcon, EyeOffIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';
const SIZE = 'tiny';

export const DisableItemAction = ( { index = -1 }: { index?: number } ) => {
	const { items, updateItem } = useRepeaterContext();

	if ( index === -1 ) {
		return null;
	}

	const propDisabled = items[ index ]?.disabled ?? false;

	const toggleLabel = propDisabled ? __( 'Show', 'elementor' ) : __( 'Hide', 'elementor' );

	const onClick = () => {
		const self = structuredClone( items[ index ] );

		self.disabled = ! self.disabled;

		if ( ! self.disabled ) {
			delete self.disabled;
		}

		updateItem( self, index );
	};

	return (
		<Tooltip title={ toggleLabel } placement="top">
			<IconButton size={ SIZE } onClick={ onClick } aria-label={ toggleLabel }>
				{ propDisabled ? <EyeOffIcon fontSize={ SIZE } /> : <EyeIcon fontSize={ SIZE } /> }
			</IconButton>
		</Tooltip>
	);
};
