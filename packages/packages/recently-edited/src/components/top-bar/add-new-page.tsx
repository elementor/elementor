import { Button } from '@elementor/ui';
import { PlusIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import useAddNewPage from '../../hooks/use-add-new-page';

export default function AddNewPage() {
	const addNewPage = useAddNewPage();

	return (
		<Button
			size="small"
			color="inherit"
			fullWidth={ true }
			sx={ { p: 7, pl: 5, fontSize: '12px', display: 'flex', justifyContent: 'flex-start' } }
			startIcon={ <PlusIcon /> }
			onClick={ addNewPage }
		>
			{ __( 'Add new page', 'elementor' ) }
		</Button>
	);
}
