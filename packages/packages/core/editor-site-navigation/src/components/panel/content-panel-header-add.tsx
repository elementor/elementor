import * as React from 'react';
import { PageTypeIcon, PlusIcon, PostTypeIcon } from '@elementor/icons';
import {
	bindMenu,
	bindTrigger,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getPostTypeCreateCapability, panelPostTypeSlugs, postTypesMap, type Slug } from '../../api/post';
import { useContentPanelCoordinator } from '../../contexts/content-panel-coordinator';
import useUser from '../../hooks/use-user';

const typeIcons: Record< Slug, typeof PageTypeIcon > = {
	page: PageTypeIcon,
	post: PostTypeIcon,
};

const HEADER_ADD_ICON_SIZE = 'tiny';

export default function ContentPanelHeaderAdd() {
	const { requestCreate } = useContentPanelCoordinator();
	const { data: user } = useUser();
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'elementor-content-panel-header-add',
	} );

	const buttonProps = bindTrigger( popupState );
	const menuProps = bindMenu( popupState );

	return (
		<>
			<IconButton
				aria-label={ __( 'Add new', 'elementor' ) }
				size={ HEADER_ADD_ICON_SIZE }
				variant="outlined"
				{ ...buttonProps }
			>
				<PlusIcon fontSize={ HEADER_ADD_ICON_SIZE } />
			</IconButton>
			<Menu { ...menuProps }>
				{ panelPostTypeSlugs.map( ( slug ) => {
					const Icon = typeIcons[ slug ];
					const createCapability = getPostTypeCreateCapability( slug );
					const singularName = postTypesMap[ slug ].labels.singular_name;

					return (
						<MenuItem
							key={ slug }
							disabled={ ! user?.capabilities?.[ createCapability ] }
							onClick={ () => {
								popupState.close();
								requestAnimationFrame( () => {
									requestCreate( slug );
								} );
							} }
						>
							<ListItemIcon>
								<Icon fontSize="small" />
							</ListItemIcon>
							<ListItemText primary={ singularName } primaryTypographyProps={ { variant: 'body2' } } />
						</MenuItem>
					);
				} ) }
			</Menu>
		</>
	);
}
