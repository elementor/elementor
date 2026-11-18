import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { Button } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getPostTypeCreateCapability } from '../../api/post';
import { usePostListContext } from '../../contexts/post-list-context';
import useUser from '../../hooks/use-user';

export default function AddNewButton() {
	const { setEditMode, type } = usePostListContext();
	const { data: user } = useUser();
	const createCapability = getPostTypeCreateCapability( type );

	return (
		<Button
			size={ 'small' }
			startIcon={ <PlusIcon /> }
			disabled={ ! user?.capabilities?.[ createCapability ] }
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
