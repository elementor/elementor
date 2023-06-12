import { useState } from 'react';
import PromptDialog from './components/prompt-dialog';
import FormMedia from './pages/form-media';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Divider } from '@elementor/ui';

const MediaDialog = ( {
	onClose,
	DialogProps,
	getControlValue,
	controlView,
	additionalOptions,
	credits,
	maybeRenderUpgradeChip,
} ) => {
	const [ hasUnsavedChanges, setHasUnsavedChanges ] = useState( false );
	const [ showUnsavedChangeAlert, setShowUnsavedChangeAlert ] = useState( false );

	const onCloseIntent = () => {
		if ( hasUnsavedChanges ) {
			setShowUnsavedChangeAlert( true );
			return;
		}

		onClose();
	};

	return (
		<>
			<PromptDialog onClose={ onCloseIntent } maxWidth="lg" { ...DialogProps }>
				<PromptDialog.Header onClose={ onCloseIntent }>
					{ maybeRenderUpgradeChip() }
				</PromptDialog.Header>

				<Divider />

				<FormMedia
					onClose={ onClose }
					getControlValue={ getControlValue }
					controlView={ controlView }
					additionalOptions={ additionalOptions }
					credits={ credits }
					setHasUnsavedChanges={ setHasUnsavedChanges }
				/>
			</PromptDialog>

			{
				showUnsavedChangeAlert && (
					<Dialog
						open={ true }
						onClose={ onClose }
						aria-labelledby="unsaved-changes-alert-title"
						aria-describedby="unsaved-changes-alert-description"
					>
						{ /* TODO: Remove borderBottom customization and fix it in the library */ }
						<DialogTitle id="unsaved-changes-alert-title" sx={ { borderBottom: 0 } }>
							{ __( 'Leave Elementor AI?', 'elementor' ) }
						</DialogTitle>

						<DialogContent>
							<DialogContentText id="unsaved-changes-alert-description">
								{ __( 'Images will be gone forever and we won’t be able to recover them.', 'elementor' ) }
							</DialogContentText>
						</DialogContent>

						<DialogActions>
							<Button onClick={ () => setShowUnsavedChangeAlert( false ) } color="secondary">
								{ __( 'Cancel', 'elementor' ) }
							</Button>
							<Button onClick={ onClose } color="error" variant="contained">
								{ __( 'Yes, leave', 'elementor' ) }
							</Button>
						</DialogActions>
					</Dialog>
				)
			}
		</>
	);
};

MediaDialog.propTypes = {
	onClose: PropTypes.func.isRequired,
	DialogProps: PropTypes.object,
	getControlValue: PropTypes.func.isRequired,
	controlView: PropTypes.object,
	additionalOptions: PropTypes.object,
	credits: PropTypes.number,
	maybeRenderUpgradeChip: PropTypes.func,
};

export default MediaDialog;
