import * as React from 'react';
import { CopyIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { isDuplicationProhibited } from '../../../utils/repeater-control';
import { useRepeaterContext } from '../context/repeater-context';
import { injectIntoRepeaterItemActions } from '../locations';

const SIZE = 'tiny';

export const DuplicateItemAction = () => {
	injectIntoRepeaterItemActions( {
		component: Action,
		id: 'repeater-item-duplicate-action',
		options: { overwrite: true },
	} );

	return null;
};

const Action = ( { index }: { index: number } ) => {
	const { items, addItem } = useRepeaterContext();
	const { bind } = useBoundProp();

	if ( isDuplicationProhibited( bind ) ) {
		return null;
	}

	const duplicateLabel = __( 'Duplicate', 'elementor' );

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
