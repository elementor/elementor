import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	Stack,
	Typography,
} from '@elementor/ui';
import { AlertTriangleFilledIcon, XIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const getDialogContent = ( type ) => {
	switch ( type ) {
		case 'both':
			return {
				title: __( 'Override all classes and variables?', 'elementor' ),
				description: __( 'This will delete all existing classes and variables and replace them with the imported ones. This action cannot be undone.', 'elementor' ),
			};
		case 'variables':
			return {
				title: __( 'Override all variables?', 'elementor' ),
				description: __( 'This will delete all existing variables and replace them with the imported ones. This action cannot be undone.', 'elementor' ),
			};
		case 'classes':
		default:
			return {
				title: __( 'Override all classes?', 'elementor' ),
				description: __( 'This will delete all existing classes and replace them with the imported ones. This action cannot be undone.', 'elementor' ),
			};
	}
};

export function OverrideConfirmationDialog( {
	open,
	onClose,
	onConfirm,
	type = 'classes',
} ) {
	const { title, description } = getDialogContent( type );

	return (
		<Dialog
			open={ open }
			onClose={ onClose }
			maxWidth="xs"
			fullWidth
		>
			<DialogContent sx={ { pt: 2, pb: 1.5 } }>
				<Stack spacing={ 1.5 }>
					<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
						<Stack direction="row" spacing={ 1.5 } alignItems="flex-start" sx={ { flex: 1 } }>
							<AlertTriangleFilledIcon
								sx={ {
									color: 'warning.dark',
									fontSize: 24,
									flexShrink: 0,
								} }
							/>
							<Typography
								variant="subtitle1"
								sx={ { fontWeight: 500 } }
							>
								{ title }
							</Typography>
						</Stack>
						<Button
							onClick={ onClose }
							sx={ {
								minWidth: 'auto',
								p: 0.5,
								color: 'text.primary',
							} }
						>
							<XIcon sx={ { fontSize: 20 } } />
						</Button>
					</Stack>

					<Typography
						variant="body2"
						color="text.secondary"
						sx={ { pr: 1 } }
					>
						{ description }
					</Typography>
				</Stack>
			</DialogContent>

			<DialogActions sx={ { px: 3, pb: 2 } }>
				<Button
					onClick={ onClose }
					color="secondary"
					variant="text"
				>
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button
					onClick={ onConfirm }
					variant="contained"
					sx={ {
						color: 'white',
						backgroundColor: 'warning.main',
						'&:hover': {
							backgroundColor: 'warning.dark',
						},
					} }
				>
					{ __( 'Save and override', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
}

OverrideConfirmationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
	type: PropTypes.oneOf( [ 'classes', 'variables', 'both' ] ),
};
