import { ArrowUpRightIcon, BriefcaseIcon, FileTextIcon, SearchIcon, SitemapIcon } from '@elementor/icons';
import Link from '@elementor/ui/Link';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

export const BUSINESS_INFO_TOOL = 'query_business_info';

export const READ_PAGE_CONTENT_TOOL = 'read_page_content';

const TOOL_ICONS = {
	search_site_content: SearchIcon,
	get_site_structure: SitemapIcon,
	[ READ_PAGE_CONTENT_TOOL ]: FileTextIcon,
	[ BUSINESS_INFO_TOOL ]: BriefcaseIcon,
};

export const BrowserToolItem = ( { tool, editDetailsUrl, isMarkdownEnabled } ) => {
	const { name, label, description } = tool;
	const Icon = TOOL_ICONS[ name ];
	const showEditDetails = BUSINESS_INFO_TOOL === name;
	const showMarkdownRequired = READ_PAGE_CONTENT_TOOL === name && ! isMarkdownEnabled;

	return (
		<Stack spacing={ 1 }>
			<Stack direction="row" alignItems="center" spacing={ 1 }>
				{ Icon && <Icon fontSize="tiny" color="inherit" /> }
				<Typography variant="subtitle2" color="text.primary">
					{ label }
				</Typography>
			</Stack>
			<Typography variant="body2" color="text.secondary">
				{ description }
			</Typography>
			{ showMarkdownRequired && (
				<Typography variant="body2" color="text.tertiary">
					{ __( 'Turn on Markdown content to make this tool available.', 'elementor' ) }
				</Typography>
			) }
			{ showEditDetails && (
				<Link
					href={ editDetailsUrl }
					variant="body2"
					color="info.main"
					underline="hover"
					sx={ { alignSelf: 'flex-start', alignItems: 'center', display: 'inline-flex', gap: 0.5 } }
				>
					{ __( 'Edit details', 'elementor' ) }
					<ArrowUpRightIcon fontSize="tiny" />
				</Link>
			) }
		</Stack>
	);
};

BrowserToolItem.propTypes = {
	tool: PropTypes.shape( {
		name: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
	} ).isRequired,
	editDetailsUrl: PropTypes.string,
	isMarkdownEnabled: PropTypes.bool.isRequired,
};
