import { sprintf } from '@wordpress/i18n';
import { ModalProvider, Text, Button, Grid } from '@elementor/app-ui';

export default function KitCloudDeleteDialog( {
	kit,
	show,
	setShow,
	onCancelClick,
	onDeleteClick,
	isLoading,
} ) {
	if ( ! kit || ! show ) {
		return null;
	}

	return (
		<ModalProvider
			title={ __( 'Delete this kit?', 'elementor' ) }
			show={ show }
			setShow={ setShow }
			onClose={ onCancelClick }
		>
			<Grid container className="e-kit-library-actions_modal__content">
				<Grid item className="e-kit-library-actions_modal__header--container">
					<Text>{ /* Translators: %s: Kit title. */ sprintf( __( 'Removing %s will permanently delete changes made to the site design and settings', 'elementor' ), kit?.title || '' ) }</Text>
				</Grid>
				<Grid container item justify="end" alignItems="center" className="e-kit-library-actions_modal__actions-container">
					<Button
						text={ __( 'Cancel', 'element' ) }
						color="link"
						variant="link"
						onClick={ () => ! isLoading && onCancelClick() }
					/>
					<Button
						text={ __( 'Delete', 'element' ) }
						color={ isLoading ? 'disabled' : 'link' }
						variant="contained"
						onClick={ () => ! isLoading && onDeleteClick() }
						className="e-kit-library-actions_modal__actions-delete-button"
					/>
				</Grid>
			</Grid>
		</ModalProvider>
	);
}

KitCloudDeleteDialog.propTypes = {
	onDeleteClick: PropTypes.func.isRequired,
	onCancelClick: PropTypes.func.isRequired,
	show: PropTypes.bool.isRequired,
	isLoading: PropTypes.bool.isRequired,
	setShow: PropTypes.func.isRequired,
	kit: PropTypes.shape( {
		id: PropTypes.string,
		title: PropTypes.string,
	} ),
};
