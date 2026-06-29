import * as React from 'react';
import { CopyIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';

export const DuplicateItemAction = () => {
	const { items, addItem, index = -1, isItemDisabled } = useRepeaterContext();

	if ( index === -1 ) {
		return null;
	}

	const duplicateLabel = __( 'Duplicate', 'elementor' );
	const item = items[ index ]?.item;

	const onClick = ( ev: React.MouseEvent ) => {
		const newItem = structuredClone( item );

		addItem( ev, { item: newItem, index: index + 1 } );
	};

	return (
		<Tooltip title={ duplicateLabel } placement="top">
			<IconButton
				size={ SIZE }
				onClick={ onClick }
				aria-label={ duplicateLabel }
				disabled={ isItemDisabled( index ) }
			>
				<CopyIcon fontSize={ SIZE } />
			</IconButton>
		</Tooltip>
	);
};
