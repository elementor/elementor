import { useEffect, useState } from 'react';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { fetchMarkdownPreview } from '../../api';
import { useMarkdownItems } from '../../hooks/use-markdown-items';
import { PostTypeList } from '../post-type-list';
import { getIncludedTypesKey, getMarkdownFileName } from './markdown-items';
import { MarkdownPreviewDialog } from './markdown-preview-dialog';
import { MarkdownPreviewPane } from './markdown-preview-pane';

export const MarkdownContentPanel = ( { settings } ) => {
	const { isEnabled, isSaving, postTypes, togglePostType } = settings;
	const includedTypesKey = getIncludedTypesKey( postTypes );
	const { items: defaultItems } = useMarkdownItems( {
		refreshKey: includedTypesKey,
		isPaused: ! isEnabled || isSaving,
	} );
	const [ picked, setPicked ] = useState( null );
	const [ content, setContent ] = useState( '' );
	const [ isExpanded, setIsExpanded ] = useState( false );

	const pickedItem = picked?.typesKey === includedTypesKey ? picked.item : null;
	const selectedItem = isEnabled ? pickedItem ?? defaultItems[ 0 ] ?? null : null;
	const selectedItemId = selectedItem?.id ?? 0;

	const selectItem = ( item ) => setPicked( { typesKey: includedTypesKey, item } );

	useEffect( () => {
		if ( ! selectedItemId ) {
			return;
		}

		let isCurrent = true;

		fetchMarkdownPreview( selectedItemId )
			.then( ( nextContent ) => {
				if ( isCurrent ) {
					setContent( nextContent );
				}
			} )
			.catch( () => {
				if ( isCurrent ) {
					setContent( '' );
				}
			} );

		return () => {
			isCurrent = false;
		};
	}, [ selectedItemId ] );

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
					/>
				</Stack>
			</Stack>
			{ selectedItem && (
				<MarkdownPreviewPane
					items={ defaultItems }
					selectedItem={ selectedItem }
					content={ content }
					onSelect={ selectItem }
					onExpand={ () => setIsExpanded( true ) }
				/>
			) }
			{ isExpanded && selectedItem && (
				<MarkdownPreviewDialog
					title={ getMarkdownFileName( selectedItem ) }
					content={ content }
					onClose={ () => setIsExpanded( false ) }
				/>
			) }
		</Stack>
	);
};

MarkdownContentPanel.propTypes = {
	settings: PropTypes.shape( {
		isEnabled: PropTypes.bool.isRequired,
		isSaving: PropTypes.bool.isRequired,
		postTypes: PropTypes.array.isRequired,
		togglePostType: PropTypes.func.isRequired,
	} ).isRequired,
};
