import * as React from 'react';
import StructureIcon from '../icons/structure-icon';
import { __ } from '@wordpress/i18n';
import { runCommand, useIsPreviewMode, useIsRouteActive } from '@elementor/v1-adapters';

export default function useActionProps() {
	const isNavigatorActive = useIsRouteActive( 'navigator' );
	const isSiteSettingsActive = useIsRouteActive( 'panel/global' );
	const isPreviewMode = useIsPreviewMode();

	const selected = isNavigatorActive && ! isPreviewMode;
	const disabled = isPreviewMode || isSiteSettingsActive;

	return {
		title: __( 'Add element', 'elementor' ),
		icon: () => <StructureIcon />,
		onClick: () => runCommand( 'navigator/toggle' ),
		selected,
		disabled,
	};
}
