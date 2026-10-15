import { ArrowsDiagonalIcon } from '@elementor/icons';
import IconButton from '@elementor/ui/IconButton';
import Stack from '@elementor/ui/Stack';
import Tooltip from '@elementor/ui/Tooltip';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { ContentPreviewPane } from '../content-preview-pane';
import { getMarkdownFileName } from './markdown-items';
import { PagePicker } from './page-picker';

export const MarkdownPreviewPane = ( { items, selectedItem, content, onSelect, onExpand } ) => {
	const header = (
		<>
			<Stack direction="row" alignItems="center" justifyContent="space-between">
				<PagePicker items={ items } selectedItem={ selectedItem } onSelect={ onSelect } />
				<Tooltip title={ __( 'Full screen', 'elementor' ) }>
					<IconButton variant="outlined" size="small" onClick={ onExpand } aria-label={ __( 'Full screen', 'elementor' ) }>
						<ArrowsDiagonalIcon fontSize="xsmall" />
					</IconButton>
				</Tooltip>
			</Stack>
			<Typography variant="caption" color="text.secondary">{ getMarkdownFileName( selectedItem ) }</Typography>
		</>
	);

	return <ContentPreviewPane header={ header } content={ content } />;
};

MarkdownPreviewPane.propTypes = {
	items: PropTypes.array.isRequired,
	selectedItem: PropTypes.shape( {
		id: PropTypes.number.isRequired,
		title: PropTypes.string.isRequired,
		path: PropTypes.string.isRequired,
	} ).isRequired,
	content: PropTypes.string.isRequired,
	onSelect: PropTypes.func.isRequired,
	onExpand: PropTypes.func.isRequired,
};
