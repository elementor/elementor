import { useState } from 'react';
import Button from '@elementor/ui/Button';
import Dialog from '@elementor/ui/Dialog';
import DialogActions from '@elementor/ui/DialogActions';
import DialogContent from '@elementor/ui/DialogContent';
import DialogContentText from '@elementor/ui/DialogContentText';
import DialogTitle from '@elementor/ui/DialogTitle';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { DIALOG_Z_INDEX } from './content-preview-dialog';

export const AllModulesControl = ( { isAnyEnabled, isDisabled, onToggleAll } ) => {
	const [ isConfirmOpen, setIsConfirmOpen ] = useState( false );

	const closeConfirm = () => setIsConfirmOpen( false );

	const confirmTurnOff = async () => {
		await onToggleAll();
		closeConfirm();
	};

	if ( ! isAnyEnabled ) {
		return (
			<Stack spacing={ 1 } alignItems="flex-start">
				<Typography variant="subtitle1">{ __( 'Agent Ready is off', 'elementor' ) }</Typography>
				<Typography variant="body2" color="text.secondary">
					{ __( 'Turn the features back on to let agents find, read and use your site.', 'elementor' ) }
				</Typography>
				<Button variant="outlined" size="small" disabled={ isDisabled } onClick={ onToggleAll } sx={ { mt: 1 } }>
					{ __( 'Turn on', 'elementor' ) }
				</Button>
			</Stack>
		);
	}

	return (
		<>
			<Stack spacing={ 1 } alignItems="flex-start">
				<Typography variant="subtitle1">{ __( 'Turn off Agent Ready', 'elementor' ) }</Typography>
				<Typography variant="body2" color="text.secondary">
					{ __( 'Agents won’t be able to use any of these features until you turn them back on.', 'elementor' ) }
				</Typography>
				<Button variant="outlined" color="error" size="small" disabled={ isDisabled } onClick={ () => setIsConfirmOpen( true ) } sx={ { mt: 1 } }>
					{ __( 'Turn off', 'elementor' ) }
				</Button>
			</Stack>
			<Dialog open={ isConfirmOpen } onClose={ closeConfirm } maxWidth="sm" fullWidth sx={ { zIndex: DIALOG_Z_INDEX } }>
				<DialogTitle>{ __( 'Turn off Agent Ready?', 'elementor' ) }</DialogTitle>
				<DialogContent>
					<DialogContentText paragraph>
						{ __( 'All the features above will be turned off, and agents will no longer be able to use them. Your settings are kept.', 'elementor' ) }
					</DialogContentText>
					<DialogContentText>
						{ __( 'You can turn them back on at any time.', 'elementor' ) }
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button color="secondary" onClick={ closeConfirm } disabled={ isDisabled }>
						{ __( 'Cancel', 'elementor' ) }
					</Button>
					<Button variant="contained" color="error" onClick={ confirmTurnOff } disabled={ isDisabled }>
						{ __( 'Turn off', 'elementor' ) }
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

AllModulesControl.propTypes = {
	isAnyEnabled: PropTypes.bool.isRequired,
	isDisabled: PropTypes.bool,
	onToggleAll: PropTypes.func.isRequired,
};
