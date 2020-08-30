import { Dialog } from '@elementor/app-ui';
import { useModulesBoundedActions } from '@elementor/store';

const notificationComponents = {
	dialog: Dialog,
};

const defaultNotification = 'dialog';

export default function Notification( props ) {
		const { dismiss: dismissAction } = useModulesBoundedActions( 'notifications' ),
			dismiss = React.useCallback( () => dismissAction( props.id ), [ props.id, dismissAction ] ),
			NotificationComponent = React.useMemo(
				() => notificationComponents[ props.ui ] || notificationComponents[ defaultNotification ],
				[ props.ui ]
			);

	return (
		<NotificationComponent dismissButtonOnClick={ dismiss } onClose={ dismiss } { ...props.componentProps } />
	);
}

Notification.propTypes = {
	id: PropTypes.string,
	ui: PropTypes.string,
	componentProps: PropTypes.object,
};
