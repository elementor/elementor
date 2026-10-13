import { ArrowsDiagonalIcon, PencilIcon } from '@elementor/icons';
import IconButton from '@elementor/ui/IconButton';
import Stack from '@elementor/ui/Stack';
import Tooltip from '@elementor/ui/Tooltip';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { LLMS_FILE_NAME } from '../../constants';
import { ContentPreviewPane } from '../content-preview-pane';

export const LlmsPreviewPane = ( { content, hasActions, onEdit, onExpand } ) => {
	const header = (
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
	);

	return <ContentPreviewPane header={ header } content={ content } />;
};

LlmsPreviewPane.propTypes = {
	content: PropTypes.string.isRequired,
	hasActions: PropTypes.bool.isRequired,
	onEdit: PropTypes.func.isRequired,
	onExpand: PropTypes.func.isRequired,
};
