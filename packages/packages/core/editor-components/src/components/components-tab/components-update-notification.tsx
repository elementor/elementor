import * as React from 'react';
import { __ } from '@wordpress/i18n';

import { ComponentsUpdateAlert } from '../components-update-alert';

export function ComponentsUpdateNotification() {
	return (
		<ComponentsUpdateAlert
			title={ __( 'Create new Components', 'elementor' ) }
			description={ __( 'To create new components, update Elementor Pro to the latest version.', 'elementor' ) }
		/>
	);
}
