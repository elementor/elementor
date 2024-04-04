import DialogHeader from '@elementor/ui/DialogHeader';
import DialogHeaderGroup from '@elementor/ui/DialogHeaderGroup';
import DialogTitle from '@elementor/ui/DialogTitle';
import DialogContent from '@elementor/ui/DialogContent';
import DialogContentText from '@elementor/ui/DialogContentText';
import TextField from '@elementor/ui/TextField';
import DialogActions from '@elementor/ui/DialogActions';
import Button from '@elementor/ui/Button';
import Dialog from '@elementor/ui/Dialog';
import { useEffect } from 'react';

const CreateNewPageDialog = ( { url, isOpen, closedDialogCallback } ) => {
	const [ open, setOpen ] = React.useState( false );
	const [ pageName, setPageName ] = React.useState( '' );

	useEffect( () => {
		setOpen( isOpen );
	}, [ isOpen ] );

	const handleDialogClose = () => {
		setOpen( false );
		closedDialogCallback();
	};

	const handleChange = ( event ) => {
		const encodedPostTitle = encodeURIComponent( event.target.value );
		const postData = { post_title: encodedPostTitle };
		const urlParams = new URLSearchParams( postData );

		setPageName( urlParams.toString() );
	};

	return (
		<Dialog
			open={ open }
			onClose={ handleDialogClose }
			maxWidth="xs"
			width="xs"
			fullWidth
		>
			<DialogHeader>
				<DialogHeaderGroup>
					<DialogTitle>{ __( 'Name your page', 'elementor' ) }</DialogTitle>
				</DialogHeaderGroup>
			</DialogHeader>

			<DialogContent dividers>
				<DialogContentText sx={ { mb: 2 } }>
					{ __( 'To proceed, please name your first page,', 'elementor' ) }
					<br />
					{ __( 'or rename it later.', 'elementor' ) }
				</DialogContentText>
				<TextField
					onChange={ handleChange }
					fullWidth
					placeholder={ __( 'New Page', 'elementor' ) }
				>
				</TextField>
			</DialogContent>

			<DialogActions>
				<Button onClick={ handleDialogClose } color="secondary">{ __( 'Cancel', 'elementor' ) }</Button>
				<Button variant="contained" href={ pageName ? url + '&' + pageName : url }>{ __( 'Save', 'elementor' ) }</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CreateNewPageDialog;

CreateNewPageDialog.propTypes = {
	url: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	closedDialogCallback: PropTypes.func.isRequired,
};
