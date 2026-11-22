import * as React from 'react';
import { PageTypeIcon, PostTypeIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, ListItemIcon, ListItemText, Menu, MenuItem, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { postTypesMap, type Slug } from '../../api/post';
import { useContentPanelCoordinator } from '../../contexts/content-panel-coordinator';
import useAccessiblePanelPostTypes from '../../hooks/use-accessible-panel-post-types';
import useCanCreate from '../../hooks/use-can-create';
import ContentPanelAddIconButton from './content-panel-add-icon-button';

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
	const canAddAny = accessibleSlugs.length > 0;

	const buttonProps = bindTrigger( popupState );
	const menuProps = bindMenu( popupState );

	const handleSelectType = ( slug: Slug ) => {
		popupState.close();
		requestAnimationFrame( () => {
			requestCreate( slug );
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
			</Menu>
		</>
	);
}
