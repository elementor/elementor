import * as React from 'react';
import {
	__useActiveDocument as useActiveDocument,
	__useHostDocument as useHostDocument,
} from '@elementor/editor-documents';
import { ChevronDownIcon } from '@elementor/icons';
import {
	bindMenu,
	bindTrigger,
	Button,
	Divider,
	ListItemText,
	ListSubheader,
	Menu,
	MenuItem,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { NUMBER_OF_RECENT_POSTS } from '../../api/recent-posts';
import useRecentPosts from '../../hooks/use-recent-posts';
import { useReverseHtmlEntities } from '../../hooks/use-reverse-html-entities';
import { type ExtendedWindow } from '../../types';
import { CreatePostListItem } from './create-post-list-item';
import Indicator from './indicator';
import { PostListItem } from './post-list-item';

export default function RecentlyEdited() {
	const activeDocument = useActiveDocument();
	const hostDocument = useHostDocument();
	const document = activeDocument && activeDocument.type.value !== 'kit' ? activeDocument : hostDocument;

	const { data } = useRecentPosts();

	const getRecentPosts = () => {
		if ( ! data ) {
			return [];
		}

		return data.filter( ( post ) => post.id !== document?.id ).splice( 0, NUMBER_OF_RECENT_POSTS - 1 );
	};
	const recentPosts = getRecentPosts();

	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'elementor-v2-top-bar-recently-edited',
	} );

	const documentTitle = useReverseHtmlEntities( document?.title );

	if ( ! document ) {
		return null;
	}

	const buttonProps = bindTrigger( popupState );

	return (
		<>
			<Button
				color="inherit"
				size="small"
				endIcon={ <ChevronDownIcon fontSize="small" /> }
				{ ...buttonProps }
				onClick={ ( e: React.MouseEvent ) => {
					const extendedWindow = window as unknown as ExtendedWindow;
					const config = extendedWindow?.elementor?.editorEvents?.config;

					if ( config ) {
						extendedWindow.elementor.editorEvents.dispatchEvent( config.names.topBar.documentNameDropdown, {
							location: config.locations.topBar,
							secondaryLocation: config.secondaryLocations.documentNameDropdown,
							trigger: config.triggers.dropdownClick,
							element: config.elements.dropdown,
						} );
					}

					buttonProps.onClick( e );
				} }
			>
				<Indicator title={ documentTitle } status={ document.status } />
			</Button>
			<Menu
				MenuListProps={ {
					subheader: (
						<ListSubheader color="primary" sx={ { fontStyle: 'italic', fontWeight: '300' } }>
							{ __( 'Recent', 'elementor' ) }
						</ListSubheader>
					),
				} }
				PaperProps={ { sx: { mt: 2.5, width: 320 } } }
				{ ...bindMenu( popupState ) }
			>
				{ recentPosts.map( ( post ) => (
					<PostListItem key={ post.id } post={ post } closePopup={ popupState.close } />
				) ) }

				{ recentPosts.length === 0 && (
					<MenuItem disabled>
						<ListItemText
							primaryTypographyProps={ {
								variant: 'caption',
								fontStyle: 'italic',
							} }
							primary={ __( 'There are no other pages or templates on this site yet.', 'elementor' ) }
						/>
					</MenuItem>
				) }

				{ /* It appears that there might be a bug in Material UI. When the divider is the first active element, it attempts to receive focus instead of the item below it. */ }
				<Divider disabled={ recentPosts.length === 0 } />

				<CreatePostListItem closePopup={ popupState.close } />
			</Menu>
		</>
	);
}
