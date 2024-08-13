import { Badge } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import * as React from 'react';
import RocketIcon from '@elementor/icons/RocketIcon';

const IconWithBadge = ( { invisible } ) => {
	return (
		<Badge color="primary" variant="dot" invisible={ invisible }>
			<RocketIcon />
		</Badge>
	);
};

IconWithBadge.propTypes = {
	invisible: PropTypes.bool,
};

export const editorV2 = () => {
	const { utilitiesMenu } = window.elementorV2.editorAppBar;

	utilitiesMenu.registerLink( {
		id: 'app-bar-menu-item-checklist',
		priority: 5,
		useProps: () => {
			return {
				title: __( 'Checklist', 'elementor' ),
				icon: () => <RocketIcon />,
				onClick: () => {
					$e.commands.run( 'checklist/toggle' );
				},
			};
		},
	} );
};

