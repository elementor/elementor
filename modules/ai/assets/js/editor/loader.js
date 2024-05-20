import PromptDialog from './components/prompt-dialog';
import Loader from './components/loader';
import PropTypes from 'prop-types';
import { Box, Typography } from '@elementor/ui';

const LoaderAI = ( { type, onClose, promptDialogStyleProps, title } ) => {
	const loaderStyle = promptDialogStyleProps ?? {
		sx: {
			'& .MuiDialog-container': {
				alignItems: 'flex-start',
				mt: 'media' === type ? '2.5vh' : '18vh',
			},
			'& .MuiDialogContent-root': {
				willChange: 'height',
				transition: 'height 300ms ease-in-out',
				position: 'relative',
			},
			'& .MuiBox-root': {
				boxSizing: 'border-box',
			},
		},
		PaperProps: {
			sx: {
				m: 0,
				maxHeight: 'media' === type ? '95vh' : '76vh',
				height: 'auto',
			},
		},
	};

	return (
		<PromptDialog onClose={ onClose } { ...loaderStyle } maxWidth={ 'media' === type ? 'lg' : 'sm' }>
			<PromptDialog.Header onClose={ onClose } />
			<PromptDialog.Content dividers>
				{ title && ( <Box style={ {
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					width: '100%', // Ensure the box takes the full width
				} }>
					<Typography variant="h6">{ title }</Typography>
				</Box> ) }
				<Loader />
			</PromptDialog.Content>
		</PromptDialog>
	);
};

LoaderAI.propTypes = {
	type: PropTypes.string,
	onClose: PropTypes.func.isRequired,
	promptDialogStyleProps: PropTypes.object,
	title: PropTypes.string,
};

export default LoaderAI;
