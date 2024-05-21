import PromptDialog from './components/prompt-dialog';
import Loader from './components/loader';
import PropTypes from 'prop-types';
import { Box, Typography } from '@elementor/ui';

const getDefaultStyles = ( type ) => ( {
	'& .MuiDialog-container': {
		alignItems: 'flex-start',
		marginTop: 'media' === type ? '2.5vh' : '18vh',
	},
	'& .MuiDialogContent-root': {
		willChange: 'height',
		transition: 'height 300ms ease-in-out',
		position: 'relative',
	},
	'& .MuiBox-root': {
		boxSizing: 'border-box',
	},
	PaperProps: {
		margin: 0,
		maxHeight: 'media' === type ? '95vh' : '76vh',
		height: 'auto',
	},
} );

// TODO: cursor pointer. do not use react render, body1, secondrty, no ai sub
const LoaderAI = ( { type, onClose, style = getDefaultStyles( type ), title } ) => {
	return (
		<PromptDialog onClose={ onClose } { ...style } maxWidth={ 'media' === type ? 'lg' : 'sm' }>
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
	style: PropTypes.object,
};

export default LoaderAI;
