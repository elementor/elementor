import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { Button } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePostListContext } from '../../contexts/post-list-context';
import useUser from '../../hooks/use-user';

export default function AddNewButton() {
	const { setEditMode } = usePostListContext();
	const { data: user } = useUser();

	return (
		<Button
			size={ 'small' }
			startIcon={ <PlusIcon /> }
			disabled={ ! user?.capabilities?.edit_pages }
			onClick={ () => {
				setEditMode( { mode: 'create', details: {} } );
			} }
			sx={ {
				px: 1.5,
			} }
		>
			{ __( 'Add New', 'elementor' ) }
		</Button>
	);
}
