import { ArrowsDiagonalIcon, PencilIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import IconButton from '@elementor/ui/IconButton';
import Stack from '@elementor/ui/Stack';
import Tooltip from '@elementor/ui/Tooltip';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { LLMS_FILE_NAME } from '../../constants';

const PREVIEW_WIDTH = 500;

const scrollbarSx = {
	scrollbarWidth: 'none',
	'&::-webkit-scrollbar': { display: 'none' },
};

export const LlmsPreviewPane = ( { content, hasActions, onEdit, onExpand } ) => {
	return (
		<Stack
			spacing={ 2 }
			p={ 4 }
			width={ PREVIEW_WIDTH }
			flexShrink={ 0 }
			bgcolor="grey.50"
			// Size containment keeps a long file from stretching the panel; the pane takes the row height and the file scrolls inside it.
			sx={ { contain: 'size' } }
		>
			<Stack direction="row" alignItems="center" justifyContent="space-between">
				<Typography variant="subtitle2" component="code" fontFamily="monospace">
					{ LLMS_FILE_NAME }
				</Typography>
				{ hasActions && (
					<Stack direction="row" spacing={ 1 }>
						<Tooltip title={ __( 'Edit', 'elementor' ) }>
							<IconButton variant="outlined" size="xsmall" onClick={ onEdit } aria-label={ __( 'Edit', 'elementor' ) }>
								<PencilIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title={ __( 'Full screen', 'elementor' ) }>
							<IconButton variant="outlined" size="small" onClick={ onExpand } aria-label={ __( 'Full screen', 'elementor' ) }>
								<ArrowsDiagonalIcon fontSize="xsmall" />
							</IconButton>
						</Tooltip>
					</Stack>
				) }
			</Stack>
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

LlmsPreviewPane.propTypes = {
	content: PropTypes.string.isRequired,
	hasActions: PropTypes.bool.isRequired,
	onEdit: PropTypes.func.isRequired,
	onExpand: PropTypes.func.isRequired,
};
