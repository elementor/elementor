import * as React from 'react';
import { useUserStylesCapability } from '@elementor/editor-styles-repository';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { globalClassesStylesProvider } from '../../global-classes-styles-provider';
import { usePrefetchCssClassUsage } from '../../hooks/use-prefetch-css-class-usage';
import { trackGlobalClasses } from '../../utils/tracking';
import { FlippedColorSwatchIcon } from './flipped-color-swatch-icon';

const EVENT_TOGGLE_DESIGN_SYSTEM = 'elementor/toggle-design-system';

export const ClassManagerButton = () => {
	const { prefetchClassesUsage } = usePrefetchCssClassUsage();

	const { userCan } = useUserStylesCapability();

	const isUserAllowedToUpdateClass = userCan( globalClassesStylesProvider.getKey() ).update;

	if ( ! isUserAllowedToUpdateClass ) {
		return null;
	}

	const handleOpenPanel = () => {
		window.dispatchEvent(
			new CustomEvent( EVENT_TOGGLE_DESIGN_SYSTEM, {
				detail: { tab: 'classes' as const },
			} )
		);

		trackGlobalClasses( {
			event: 'classManagerOpened',
			source: 'style-panel',
		} );
		prefetchClassesUsage();
	};

	return (
		<Tooltip title={ __( 'Class Manager', 'elementor' ) } placement="top">
			<IconButton size="tiny" onClick={ handleOpenPanel } sx={ { marginInlineEnd: -0.75 } }>
				<FlippedColorSwatchIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
