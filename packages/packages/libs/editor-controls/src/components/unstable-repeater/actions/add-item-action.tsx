import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';
const disabled = false;

export const AddItemAction = () => {
	const { setIsOpen } = useRepeaterContext();

	const addRepeaterItem = () => {
		setIsOpen( true );
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
