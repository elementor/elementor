import * as React from 'react';
import { __ } from '@wordpress/i18n';

import { ComponentsUpgradeAlert } from '../components-upgrade-alert';

const UPGRADE_URL = 'https://go.elementor.com/go-pro-components-create/';

export function ComponentsProNotification() {
	return (
		<ComponentsUpgradeAlert
			title={ __( 'Create new components', 'elementor' ) }
			description={ __( 'Creating new components requires an active Pro subscription.', 'elementor' ) }
			upgradeUrl={ UPGRADE_URL }
		/>
	);
}
