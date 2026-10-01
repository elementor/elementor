import { useState } from 'react';
import { AlertCircleIcon } from '@elementor/icons';
import Chip from '@elementor/ui/Chip';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { LlmsPreviewDialog } from './llms-preview-dialog';
import { LlmsPreviewPane } from './llms-preview-pane';
import { PostTypeList } from './post-type-list';

const getWarningMessage = ( hasPhysicalFile, isManuallyEdited ) => {
	if ( hasPhysicalFile ) {
		return __( 'LLMs.txt file already exists and can’t be managed here.', 'elementor' );
	}

	if ( isManuallyEdited ) {
		return __( 'This file was edited manually and no longer syncs automatically.', 'elementor' );
	}

	return '';
};

export const LlmsTxtPanel = ( { settings } ) => {
	const { content, hasPhysicalFile, isEnabled, isManuallyEdited, postTypes, saveContent, togglePostType } = settings;
	const [ dialogMode, setDialogMode ] = useState( null );

	const warningMessage = getWarningMessage( hasPhysicalFile, isManuallyEdited );

	// Edited rows keep their values so the admin still sees what the file was generated from; nothing is generated from a server file.
	const displayedPostTypes = hasPhysicalFile
		? postTypes.map( ( postType ) => ( { ...postType, included: false } ) )
		: postTypes;

	const closeDialog = () => setDialogMode( null );

	return (
		<Stack direction="row">
			<Stack spacing={ 3 } px={ 6 } py={ 3 } flexGrow={ 1 }>
				<Stack spacing={ 1 }>
					<Typography variant="subtitle1">{ __( 'Help agents find your content', 'elementor' ) }</Typography>
					<Typography variant="body2" color="text.secondary">
						{ __( 'llms.txt is a simple guide that tells AI agents what your site is about and where to find its public content. We keep it up to date automatically.', 'elementor' ) }
					</Typography>
				</Stack>
				<Stack spacing={ 1 }>
					<Typography variant="subtitle1">{ __( 'Choose what to include', 'elementor' ) }</Typography>
					<PostTypeList
						postTypes={ displayedPostTypes }
						isDisabled={ ! isEnabled || isManuallyEdited }
						onToggle={ togglePostType }
					/>
				</Stack>
				{ warningMessage && (
					<Stack direction="row">
						<Chip
							icon={ <AlertCircleIcon /> }
							label={ warningMessage }
							color="warning"
							size="small"
							shape="rounded"
							variant="standard"
						/>
					</Stack>
				) }
			</Stack>
			{ ( isEnabled || hasPhysicalFile ) && (
				<LlmsPreviewPane
					content={ hasPhysicalFile ? '' : content }
					hasActions={ ! hasPhysicalFile }
					onEdit={ () => setDialogMode( 'edit' ) }
					onExpand={ () => setDialogMode( 'view' ) }
				/>
			) }
			{ dialogMode && (
				<LlmsPreviewDialog
					content={ content }
					isEditing={ 'edit' === dialogMode }
					onClose={ closeDialog }
					onSave={ saveContent }
				/>
			) }
		</Stack>
	);
};

LlmsTxtPanel.propTypes = {
	settings: PropTypes.shape( {
		content: PropTypes.string.isRequired,
		hasPhysicalFile: PropTypes.bool.isRequired,
		isEnabled: PropTypes.bool.isRequired,
		isManuallyEdited: PropTypes.bool.isRequired,
		postTypes: PropTypes.array.isRequired,
		saveContent: PropTypes.func.isRequired,
		togglePostType: PropTypes.func.isRequired,
	} ).isRequired,
};
