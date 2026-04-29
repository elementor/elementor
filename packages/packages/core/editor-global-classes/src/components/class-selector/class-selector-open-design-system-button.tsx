import * as React from 'react';
import { SettingsIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { trackGlobalClasses } from '../../utils/tracking';

const EVENT_NAME = 'elementor/open-global-classes-manager';
const TOOLTIP = __( 'Global classes', 'elementor' );

/**
 * Style tab class selector: opens the Design system panel on the Classes tab (same pattern as
 * the variables popover settings shortcut).
 */
export function ClassSelectorOpenDesignSystemButton() {
	const onClick = () => {
		void trackGlobalClasses( { event: 'classManagerOpened', source: 'style-panel' } );
		window.dispatchEvent( new CustomEvent( EVENT_NAME ) );
	};

	return (
		<Tooltip placement="top" title={ TOOLTIP }>
			<IconButton
				id="global-classes-manager-button"
				size="tiny"
				onClick={ onClick }
				aria-label={ TOOLTIP }
			>
				<SettingsIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
}
