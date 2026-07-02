import * as React from 'react';
import { useState } from 'react';
import { notify } from '@elementor/editor-notifications';
import { DetachIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../types';
import { detachComponentInstance } from '../../utils/detach-component-instance';
import { DetachInstanceConfirmationDialog } from '../detach-instance-confirmation-dialog';
import { EditComponentAction } from './instance-panel-header';

export const DetachAction = ( {
	componentInstanceId,
	componentId,
}: {
	componentInstanceId: string;
	componentId: number;
} ) => {
	const [ isDetachDialogOpen, setIsDetachDialogOpen ] = useState( false );

	const handleDetachConfirm = async () => {
		setIsDetachDialogOpen( false );

		try {
			await detachComponentInstance( {
				instanceId: componentInstanceId,
				componentId,
				trackingInfo: getDetachTrackingInfo(),
			} );
		} catch {
			notify( {
				type: 'error',
				message: __( 'Failed to detach component instance.', 'elementor' ),
				id: 'detach-component-instance-failed',
			} );
		}
	};

	const handleDetachCancel = () => {
		setIsDetachDialogOpen( false );
	};

	const handleDetachClick = () => {
		setIsDetachDialogOpen( true );
	};

	const detachLabel = __( 'Detach from Component', 'elementor' );

	return (
		<>
			<EditComponentAction label={ detachLabel } icon={ DetachIcon } onClick={ handleDetachClick } />
			<DetachInstanceConfirmationDialog
				open={ isDetachDialogOpen }
				onClose={ handleDetachCancel }
				onConfirm={ handleDetachConfirm }
			/>
		</>
	);
};

function getDetachTrackingInfo() {
	const extendedWindow = window as unknown as ExtendedWindow;
	const config = extendedWindow?.elementorCommon?.eventsManager?.config;

	if ( ! config ) {
		return {
			location: '',
			trigger: '',
		};
	}

	return {
		location: ( config.locations.components as Record< string, string > ).instanceEditingPanel,
		trigger: config.triggers.click,
	};
}
