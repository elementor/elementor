import { useState } from 'react';
import { BriefcaseIcon, FileTextIcon, SearchIcon, SitemapIcon } from '@elementor/icons';
import Button from '@elementor/ui/Button';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { BusinessDetailsForm } from './business-details-form';

export const BUSINESS_INFO_TOOL = 'query_business_info';

export const READ_PAGE_CONTENT_TOOL = 'read_page_content';

const TOOL_ICONS = {
	search_site_content: SearchIcon,
	get_site_structure: SitemapIcon,
	[ READ_PAGE_CONTENT_TOOL ]: FileTextIcon,
	[ BUSINESS_INFO_TOOL ]: BriefcaseIcon,
};

export const BrowserToolItem = ( { tool, businessDetails = '', maxBusinessDetailsLength, onSaveBusinessDetails, isMarkdownEnabled } ) => {
	const { name, label, description } = tool;
	const [ isEditingDetails, setIsEditingDetails ] = useState( false );
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
			{ showEditDetails && ! isEditingDetails && (
				<Button
					variant="text"
					size="small"
					color="info"
					onClick={ () => setIsEditingDetails( true ) }
					sx={ { alignSelf: 'flex-start', '&&': { ml: -0.625 } } }
				>
					{ __( 'Edit details', 'elementor' ) }
				</Button>
			) }
			{ showEditDetails && isEditingDetails && (
				<BusinessDetailsForm
					details={ businessDetails }
					maxLength={ maxBusinessDetailsLength }
					onSave={ onSaveBusinessDetails }
					onClose={ () => setIsEditingDetails( false ) }
				/>
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
	businessDetails: PropTypes.string,
	maxBusinessDetailsLength: PropTypes.number,
	onSaveBusinessDetails: PropTypes.func,
	isMarkdownEnabled: PropTypes.bool.isRequired,
};
