import { useEffect, useState } from 'react';
import { AlertCircleIcon } from '@elementor/icons';
import Button from '@elementor/ui/Button';
import Chip from '@elementor/ui/Chip';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { fetchMarkdownPreview, revertMarkdownContent, saveMarkdownContent } from '../../api';
import { MARKDOWN_SETTINGS_KEY } from '../../constants';
import { useMarkdownItems } from '../../hooks/use-markdown-items';
import { ConfirmDialog } from '../confirm-dialog';
import { ContentEditDialog } from '../content-edit-dialog';
import { PostTypeList } from '../post-type-list';
import { getIncludedTypesKey, getMarkdownFileName } from './markdown-items';
import { MarkdownPreviewPane } from './markdown-preview-pane';

const DIALOG_MODE_EDIT = 'edit';
const DIALOG_MODE_VIEW = 'view';
const DIALOG_MODE_REVERT = 'revert';

export const MarkdownContentPanel = ( { settings } ) => {
	const { excludedPostIds, exclusionsSavedVersion, flushExclusions, isEnabled, isSaving, postTypes, togglePostExclusion, togglePostType } = settings;
	const [ revision, setRevision ] = useState( 0 );
	const itemsKey = `${ getIncludedTypesKey( postTypes ) }|${ exclusionsSavedVersion }|${ revision }`;
	const { items: defaultItems } = useMarkdownItems( {
		refreshKey: itemsKey,
		isPaused: ! isEnabled || isSaving,
	} );
	const [ picked, setPicked ] = useState( null );
	const [ content, setContent ] = useState( '' );
	const [ isOverridden, setIsOverridden ] = useState( false );
	const [ dialogMode, setDialogMode ] = useState( null );

	const pickedItem = picked?.itemsKey === itemsKey ? picked.item : null;
	const selectedItem = isEnabled ? pickedItem ?? defaultItems[ 0 ] ?? null : null;
	const selectedItemId = selectedItem?.id ?? 0;

	const selectItem = ( item ) => setPicked( { itemsKey, item } );
	const closeDialog = () => setDialogMode( null );

	const refreshAfterChange = () => setRevision( ( current ) => current + 1 );

	const saveContent = ( nextContent ) => saveMarkdownContent( selectedItemId, nextContent ).then( refreshAfterChange );

	const revertContent = () => revertMarkdownContent( selectedItemId ).then( refreshAfterChange );

	useEffect( () => {
		if ( ! selectedItemId ) {
			return;
		}

		let isCurrent = true;

		setContent( '' );

		fetchMarkdownPreview( selectedItemId )
			.then( ( preview ) => {
				if ( isCurrent ) {
					setContent( preview.content );
					setIsOverridden( preview.isOverridden );
				}
			} )
			.catch( () => {
				if ( isCurrent ) {
					setContent( '' );
					setIsOverridden( false );
				}
			} );

		return () => {
			isCurrent = false;
		};
	}, [ selectedItemId, revision ] );

	return (
		<Stack direction="row" width="100%" maxWidth="100%" minWidth={ 0 } overflow="auto">
			<Stack spacing={ 3 } px={ 6 } py={ 3 } flexGrow={ 1 } flexShrink={ 1 } flexBasis={ 0 } minWidth={ 0 }>
				<Stack spacing={ 1 }>
					<Typography variant="subtitle1">{ __( 'Make your content easier to read', 'elementor' ) }</Typography>
					<Typography variant="body2" color="text.secondary">
						{ __( 'Give agents a clean Markdown version of your content', 'elementor' ) }
					</Typography>
				</Stack>
				<Stack spacing={ 1 }>
					<Typography variant="subtitle1">{ __( 'Choose what to include', 'elementor' ) }</Typography>
					<PostTypeList
						postTypes={ postTypes }
						isDisabled={ ! isEnabled || isSaving }
						onToggle={ togglePostType }
						exclusions={ {
							module: MARKDOWN_SETTINGS_KEY,
							excludedPostIds,
							onToggle: togglePostExclusion,
							onClose: flushExclusions,
						} }
					/>
				</Stack>
				{ selectedItem && isOverridden && (
					<Stack alignItems="flex-start" spacing={ 1 }>
						<Chip
							icon={ <AlertCircleIcon /> }
							label={ __( 'This page was edited manually and no longer syncs automatically.', 'elementor' ) }
							color="warning"
							size="small"
							shape="rounded"
							variant="standard"
						/>
						<Button variant="outlined" size="small" onClick={ () => setDialogMode( DIALOG_MODE_REVERT ) }>
							{ __( 'Revert to generated version', 'elementor' ) }
						</Button>
					</Stack>
				) }
			</Stack>
			{ selectedItem && (
				<MarkdownPreviewPane
					items={ defaultItems }
					selectedItem={ selectedItem }
					content={ content }
					onSelect={ selectItem }
					hasContent={ '' !== content }
					onEdit={ () => setDialogMode( DIALOG_MODE_EDIT ) }
					onExpand={ () => setDialogMode( DIALOG_MODE_VIEW ) }
				/>
			) }
			{ [ DIALOG_MODE_EDIT, DIALOG_MODE_VIEW ].includes( dialogMode ) && selectedItem && (
				<ContentEditDialog
					title={ getMarkdownFileName( selectedItem ) }
					content={ content }
					isEditing={ DIALOG_MODE_EDIT === dialogMode }
					onClose={ closeDialog }
					onSave={ saveContent }
				/>
			) }
			{ DIALOG_MODE_REVERT === dialogMode && (
				<ConfirmDialog
					title={ __( 'Revert to generated version?', 'elementor' ) }
					message={ __( 'Your manual edits will be discarded. The markdown for this page will be regenerated from your current site content and kept up to date automatically.', 'elementor' ) }
					confirmLabel={ __( 'Revert', 'elementor' ) }
					onConfirm={ revertContent }
					onClose={ closeDialog }
				/>
			) }
		</Stack>
	);
};

MarkdownContentPanel.propTypes = {
	settings: PropTypes.shape( {
		excludedPostIds: PropTypes.arrayOf( PropTypes.number ).isRequired,
		exclusionsSavedVersion: PropTypes.number.isRequired,
		flushExclusions: PropTypes.func.isRequired,
		isEnabled: PropTypes.bool.isRequired,
		isSaving: PropTypes.bool.isRequired,
		postTypes: PropTypes.array.isRequired,
		togglePostExclusion: PropTypes.func.isRequired,
		togglePostType: PropTypes.func.isRequired,
	} ).isRequired,
};
