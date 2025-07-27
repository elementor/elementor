import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';

export const AddItemAction = ( {
	disabled = false,
	tooltip: Tooltip = React.Fragment,
}: {
	disabled?: boolean;
	tooltip?: React.JSXElementConstructor< React.PropsWithChildren< unknown > >;
} ) => {
	const { initial, uniqueKeys, setUniqueKeys, items, setItems, setOpenItem } = useRepeaterContext();

	const onClick = () => {
		const newItem = structuredClone( initial );
		const newKey = generateNextKey( uniqueKeys );

		setItems( [ ...items, newItem ] );
		setUniqueKeys( [ ...uniqueKeys, newKey ] );

		setOpenItem( newKey );
	};

	const generateNextKey = ( source: number[] ) => {
		return 1 + Math.max( 0, ...source );
	};

	return (
		<Tooltip>
			<IconButton
				size={ SIZE }
				sx={ { ml: 'auto' } }
				disabled={ disabled }
				onClick={ onClick }
				aria-label={ __( 'Add item', 'elementor' ) }
			>
				<PlusIcon fontSize={ SIZE } />
			</IconButton>
		</Tooltip>
	);
};
