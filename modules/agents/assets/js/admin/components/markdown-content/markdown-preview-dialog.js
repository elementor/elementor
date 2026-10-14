import Box from '@elementor/ui/Box';
import PropTypes from 'prop-types';

import { ContentPreviewDialog } from '../content-preview-dialog';

export const MarkdownPreviewDialog = ( { title, content, onClose } ) => {
	return (
		<ContentPreviewDialog title={ title } onClose={ onClose }>
			<Box component="pre" m={ 0 } typography="body2" fontFamily="monospace" whiteSpace="pre-wrap">
				{ content }
			</Box>
		</ContentPreviewDialog>
	);
};

MarkdownPreviewDialog.propTypes = {
	title: PropTypes.string.isRequired,
	content: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
};
