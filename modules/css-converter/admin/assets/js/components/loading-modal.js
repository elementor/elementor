import {
	Dialog,
	DialogContent,
	Box,
	CircularProgress,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const LoadingModal = ( { loadingText } ) => {
	return (
		<Dialog
			open={ true }
			onClose={ () => {} }
			maxWidth="sm"
			fullWidth
		>
			<DialogContent>
				<Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 } }>
					<CircularProgress sx={ { mb: 2 } } />
					<Typography variant="body1">{ loadingText }</Typography>
				</Box>
			</DialogContent>
		</Dialog>
	);
};
