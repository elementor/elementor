import * as EditorAppBar from '@elementor/editor-app-bar';
import { __ } from '@wordpress/i18n';
import * as React from 'react';
import { Chip } from '@elementor/ui';
import { UpgradeIcon } from '@elementor/icons';

if ( ! elementor.helpers.hasPro() && elementorCommon.config?.experimentalFeatures?.editor_v2 ) {
	registerPromotionToTopBar();
}

function registerPromotionToTopBar() {
	const { promotionsMenu } = EditorAppBar;

	promotionsMenu?.registerLink?.( {
		id: 'app-bar-menu-item-promotion',
		priority: 4,
		useProps: () => ( {
			title: __( 'Upgrade', 'elementor' ),
			href: 'https://go.elementor.com/go-pro-editor-top-bar-upgrade/',
			target: '_blank', // Optional
			icon: () => <Chip
				size="small"
				sx={ {
					'.MuiChip-label': {
						lineHeight: '18px',
					},
				} }
				icon={ <UpgradeIcon /> }
				label={ __( 'Upgrade', 'elementor' ) }
				variant="filled"
				color="promotion"
			/>,
		} ),
	} );
}
