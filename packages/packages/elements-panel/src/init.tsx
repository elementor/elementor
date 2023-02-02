import * as React from 'react';
import { registerToggleAction } from '@elementor/top-bar';
import { openRoute, useIsPreviewMode, useIsRouteActive } from '@elementor/v1-adapters';
import { __ } from '@wordpress/i18n';
import { SvgIcon } from '@elementor/ui';

export default function init() {
	registerTopBarActions();
}

function registerTopBarActions() {
	registerToggleAction( 'tools', {
		name: 'open-elements-panel',
		useProps: () => {
			const isInElementsPanel = useIsRouteActive( 'panel/elements' );
			const isInSiteSettings = useIsRouteActive( 'panel/global' );
			const isPreview = useIsPreviewMode();

			const selected = isInElementsPanel && ! isPreview;
			const disabled = isPreview || isInSiteSettings;

			return {
				title: __( 'Add element', 'elementor' ),
				icon: () => (
					<SvgIcon viewBox="0 0 24 24">
						<path d="M11 4.75C11 4.33579 11.3358 4 11.75 4C12.1642 4 12.5 4.33579 12.5 4.75V11H18.75C19.1642 11 19.5 11.3358 19.5 11.75C19.5 12.1642 19.1642 12.5 18.75 12.5H12.5V18.75C12.5 19.1642 12.1642 19.5 11.75 19.5C11.3358 19.5 11 19.1642 11 18.75V12.5H4.75C4.33579 12.5 4 12.1642 4 11.75C4 11.3358 4.33579 11 4.75 11H11V4.75Z" />
					</SvgIcon>
				),
				onClick: () => openRoute( 'panel/elements/categories' ),
				selected,
				disabled,
			};
		},
	} );
}
