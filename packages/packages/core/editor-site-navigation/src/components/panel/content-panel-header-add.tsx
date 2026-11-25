import * as React from 'react';
import { PageTypeIcon, PostTypeIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, ListItemIcon, ListItemText, Menu, MenuItem, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { postTypesMap, type Slug } from '../../api/post';
import { useContentPanelCoordinator } from '../../contexts/content-panel-coordinator';
import useAccessiblePanelPostTypes from '../../hooks/use-accessible-panel-post-types';
import useCanCreate from '../../hooks/use-can-create';
import { env } from '../../env';
import { POPUPS_SITE_CONTENT_SECTION_ID } from '../../popups/constants';
import { getSiteContentHeaderCreateItems } from '../../site-content-header-create-items';
import ContentPanelAddIconButton from './content-panel-add-icon-button';
import PopupHeaderCreateMenuItem from './popups/popup-header-create-menu-item';

const typeIcons: Record< Slug, typeof PageTypeIcon > = {
	page: PageTypeIcon,
	post: PostTypeIcon,
};

function HeaderAddMenuItem( { slug, onSelect }: { slug: Slug; onSelect: ( slug: Slug ) => void } ) {
	const canCreate = useCanCreate( slug );
	const Icon = typeIcons[ slug ];
	const singularName = postTypesMap[ slug ].labels.singular_name;

	return (
		<MenuItem disabled={ ! canCreate } onClick={ () => onSelect( slug ) }>
			<ListItemIcon>
				<Icon fontSize="small" />
			</ListItemIcon>
			<ListItemText primary={ singularName } primaryTypographyProps={ { variant: 'body2' } } />
		</MenuItem>
	);
}

export default function ContentPanelHeaderAdd() {
	const { requestCreate } = useContentPanelCoordinator();
	const { accessiblePostTypes: accessibleSlugs } = useAccessiblePanelPostTypes();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'elementor-content-panel-header-add',
	} );
	const headerCreateItems = getSiteContentHeaderCreateItems();
	const showPopupHeaderItem = env.popups !== undefined;
	const canAddAny = accessibleSlugs.length > 0 || headerCreateItems.length > 0 || showPopupHeaderItem;

	const buttonProps = bindTrigger( popupState );
	const menuProps = bindMenu( popupState );

	const handleSelectType = ( slug: Slug ) => {
		popupState.close();
		requestAnimationFrame( () => {
			requestCreate( slug );
		} );
	};

	const handleSelectPopup = () => {
		popupState.close();
		requestAnimationFrame( () => {
			requestCreate( POPUPS_SITE_CONTENT_SECTION_ID );
		} );
	};

	return (
		<>
			<ContentPanelAddIconButton
				aria-label={ __( 'Add new', 'elementor' ) }
				{ ...buttonProps }
				disabled={ ! canAddAny }
			/>
			<Menu { ...menuProps }>
				{ accessibleSlugs.map( ( slug ) => (
					<HeaderAddMenuItem key={ slug } onSelect={ handleSelectType } slug={ slug } />
				) ) }
				{ showPopupHeaderItem && <PopupHeaderCreateMenuItem onSelect={ handleSelectPopup } /> }
				{ headerCreateItems.map( ( item ) => (
					<React.Fragment key={ item.id }>
						{ item.renderMenuItem( () => {
							popupState.close();
							requestAnimationFrame( () => {
								requestCreate( item.id );
							} );
						} ) }
					</React.Fragment>
				) ) }
			</Menu>
		</>
	);
}
