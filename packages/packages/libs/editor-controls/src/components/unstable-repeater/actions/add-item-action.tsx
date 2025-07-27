import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';
const disabled = false;

export const AddItemAction = () => {
	const { initial, uniqueKeys, setUniqueKeys, items, setItems, setOpenItem } = useRepeaterContext();

	const addRepeaterItem = () => {
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
		<IconButton
			size={ SIZE }
			sx={ { ml: 'auto' } }
			disabled={ disabled }
			onClick={ addRepeaterItem }
			aria-label={ __( 'Add item', 'elementor' ) }
		>
			<PlusIcon fontSize={ SIZE } />
		</IconButton>
	);
};
