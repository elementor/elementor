import * as React from 'react';
import { CopyIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { injectIntoRepeaterItemActions } from '../../../locations';
import { useRepeaterContext } from '../context/repeater-context';
import { useBoundProp } from '@elementor/editor-editing-panel';

const SIZE = 'tiny';

export const DuplicateItemAction = () => {
	injectIntoRepeaterItemActions( {
		component: Action,
		id: 'repeater-item-duplicate-action',
	} );

	return null;
};

const Action = ( { index }: { index: number } ) => {
	const { items, addItem } = useRepeaterContext();
	const { bind } = useBoundProp();
	const duplicateLabel = __( 'Duplicate', 'elementor' );

	if ( bind === 'transform' ) {
		return null;
	}

	const onClick = () => {
		const newItem = structuredClone( items[ index ] );

		addItem( { item: newItem, index: index + 1 } );
	};

	return (
		<Tooltip title={ duplicateLabel } placement="top">
			<IconButton size={ SIZE } onClick={ onClick } aria-label={ duplicateLabel }>
				<CopyIcon fontSize={ SIZE } />
			</IconButton>
		</Tooltip>
	);
};
