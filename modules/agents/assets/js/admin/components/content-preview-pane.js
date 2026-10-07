import Box from '@elementor/ui/Box';
import Stack from '@elementor/ui/Stack';
import PropTypes from 'prop-types';

const PREVIEW_WIDTH = 500;

const scrollbarSx = {
	scrollbarWidth: 'none',
	'&::-webkit-scrollbar': { display: 'none' },
};

export const ContentPreviewPane = ( { header, content } ) => {
	return (
		<Stack
			spacing={ 2 }
			p={ 4 }
			width={ PREVIEW_WIDTH }
			maxWidth="100%"
			minWidth={ 0 }
			flexShrink={ 1 }
			bgcolor="grey.50"
			// Size containment keeps a long file from stretching the panel; the pane takes the row height and the file scrolls inside it.
			sx={ { contain: 'size' } }
		>
			{ header }
			<Box
				component="pre"
				m={ 0 }
				flexGrow={ 1 }
				minHeight={ 0 }
				overflow="auto"
				typography="caption"
				fontFamily="monospace"
				sx={ scrollbarSx }
			>
				{ content }
			</Box>
		</Stack>
	);
};

ContentPreviewPane.propTypes = {
	header: PropTypes.node.isRequired,
	content: PropTypes.string.isRequired,
};
