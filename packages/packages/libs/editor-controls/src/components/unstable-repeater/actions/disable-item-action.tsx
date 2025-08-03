import * as React from 'react';
import { EyeIcon, EyeOffIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';
import { injectIntoRepeaterItemActions } from '../locations';

const SIZE = 'tiny';

export const DisableItemAction = () => {
	injectIntoRepeaterItemActions( {
		component: Action,
		id: 'repeater-item-disable-action',
		options: { overwrite: true },
	} );

	return null;
};

const Action = ( { index }: { index: number } ) => {
	const { items, updateItem } = useRepeaterContext();
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
