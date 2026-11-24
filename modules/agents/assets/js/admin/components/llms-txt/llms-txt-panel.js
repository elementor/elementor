import { useState } from 'react';
import { AlertCircleIcon } from '@elementor/icons';
import Alert from '@elementor/ui/Alert';
import Button from '@elementor/ui/Button';
import Chip from '@elementor/ui/Chip';
import Link from '@elementor/ui/Link';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { FILE_TYPE_LLMS_TXT } from '../../analytics/agent-ready-events';
import { trackFileOpened } from '../../analytics/track-agent-ready-event';
import { LLMS_FILE_NAME, LLMS_SETTINGS_KEY } from '../../constants';
import { ConfirmDialog } from '../confirm-dialog';
import { ContentEditDialog } from '../content-edit-dialog';
import { PostTypeList } from '../post-type-list';
import { CustomTextSection } from './custom-text-section';
import { LlmsPreviewPane } from './llms-preview-pane';

const DIALOG_MODE_EDIT = 'edit';
const DIALOG_MODE_VIEW = 'view';
const DIALOG_MODE_REVERT = 'revert';
const DIALOG_MODE_TAKE_OVER = 'take-over';

export const LlmsTxtPanel = ( { settings } ) => {
	const {
		content,
		customText,
		excludedPostIds,
		flushExclusions,
		hasPhysicalFile,
		isEnabled,
		isManuallyEdited,
		isSaving,
		maxCustomTextLength,
		postTypes,
		revertContent,
		saveContent,
		saveCustomText,
		takeOverFile,
		togglePostExclusion,
		togglePostType,
	} = settings;
	const [ dialogMode, setDialogMode ] = useState( null );
	const canChooseItems = ! hasPhysicalFile && ! isManuallyEdited;

	// Edited rows keep their values so the admin still sees what the file was generated from; nothing is generated from a server file.
	const displayedPostTypes = hasPhysicalFile
		? postTypes.map( ( postType ) => ( { ...postType, included: false } ) )
		: postTypes;

	const closeDialog = () => setDialogMode( null );

	const handleEdit = () => {
		trackFileOpened( { fileType: FILE_TYPE_LLMS_TXT } );
		setDialogMode( DIALOG_MODE_EDIT );
	};

	return (
		<Stack direction="row" width="100%" maxWidth="100%" minWidth={ 0 } overflow="auto">
			<Stack spacing={ 3 } px={ 6 } py={ 3 } flexGrow={ 1 } flexShrink={ 1 } flexBasis={ 0 } minWidth={ 0 }>
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
						isDisabled={ ! isEnabled || isManuallyEdited || isSaving }
						onToggle={ togglePostType }
						exclusions={ canChooseItems ? {
							module: LLMS_SETTINGS_KEY,
							excludedPostIds,
							onToggle: togglePostExclusion,
							onClose: flushExclusions,
						} : undefined }
					/>
				</Stack>
				{ ! hasPhysicalFile && (
					<CustomTextSection
						customText={ customText }
						maxLength={ maxCustomTextLength }
						isDisabled={ ! isEnabled || isManuallyEdited || isSaving }
						onSave={ saveCustomText }
					/>
				) }
				{ hasPhysicalFile && (
					<Stack alignItems="flex-start" spacing={ 1 }>
						<Chip
							icon={ <AlertCircleIcon /> }
							label={ __( 'This file is managed outside Agent Ready and can’t be controlled from here.', 'elementor' ) }
							color="warning"
							size="small"
							shape="rounded"
							variant="standard"
						/>
						<Button variant="outlined" size="small" onClick={ () => setDialogMode( DIALOG_MODE_TAKE_OVER ) }>
							{ __( 'Take over llms.txt', 'elementor' ) }
						</Button>
					</Stack>
				) }
			</Stack>
			{ ( isEnabled || hasPhysicalFile ) && (
				<LlmsPreviewPane
					content={ hasPhysicalFile ? '' : content }
					footer={ isManuallyEdited && ! hasPhysicalFile && (
						<Alert severity="warning">
							{ __( 'You’re editing llms.txt by hand. Switch back to auto-sync to use this field.', 'elementor' ) }
							{ ' ' }
							<Link component="button" type="button" variant="body2" color="inherit" onClick={ () => setDialogMode( DIALOG_MODE_REVERT ) }>
								{ __( 'Switch back', 'elementor' ) }
							</Link>
						</Alert>
					) }
					hasActions={ ! hasPhysicalFile }
					onEdit={ handleEdit }
					onExpand={ () => setDialogMode( DIALOG_MODE_VIEW ) }
				/>
			) }
			{ DIALOG_MODE_REVERT === dialogMode && (
				<ConfirmDialog
					title={ __( 'Revert to generated version?', 'elementor' ) }
					message={ __( 'Your manual edits will be discarded. llms.txt will be regenerated from your current site content and kept up to date automatically.', 'elementor' ) }
					confirmLabel={ __( 'Revert', 'elementor' ) }
					onConfirm={ revertContent }
					onClose={ closeDialog }
				/>
			) }
			{ DIALOG_MODE_TAKE_OVER === dialogMode && (
				<ConfirmDialog
					title={ __( 'Take over llms.txt?', 'elementor' ) }
					message={ __( 'The existing llms.txt file will be replaced with the version generated by Agent Ready. Its current content will be overwritten and can’t be recovered.', 'elementor' ) }
					confirmLabel={ __( 'Take over', 'elementor' ) }
					onConfirm={ takeOverFile }
					onClose={ closeDialog }
				/>
			) }
			{ [ DIALOG_MODE_EDIT, DIALOG_MODE_VIEW ].includes( dialogMode ) && (
				<ContentEditDialog
					title={ LLMS_FILE_NAME }
					content={ content }
					isEditing={ DIALOG_MODE_EDIT === dialogMode }
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
		customText: PropTypes.string.isRequired,
		excludedPostIds: PropTypes.arrayOf( PropTypes.number ).isRequired,
		flushExclusions: PropTypes.func.isRequired,
		hasPhysicalFile: PropTypes.bool.isRequired,
		isEnabled: PropTypes.bool.isRequired,
		isManuallyEdited: PropTypes.bool.isRequired,
		isSaving: PropTypes.bool.isRequired,
		maxCustomTextLength: PropTypes.number.isRequired,
		postTypes: PropTypes.array.isRequired,
		revertContent: PropTypes.func.isRequired,
		saveContent: PropTypes.func.isRequired,
		saveCustomText: PropTypes.func.isRequired,
		takeOverFile: PropTypes.func.isRequired,
		togglePostExclusion: PropTypes.func.isRequired,
		togglePostType: PropTypes.func.isRequired,
	} ).isRequired,
};
