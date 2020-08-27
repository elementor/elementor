import { Dialog } from '@elementor/app-ui';
import { useDispatch, useSliceActions } from '@elementor/store';

const notificationComponents = {
	dialog: Dialog,
};

const defaultNotification = 'dialog';

export default function Notification( props ) {
	const dispatch = useDispatch(),
		{ dismiss } = useSliceActions( 'notifications' ),
		onCloseHandler = React.useCallback( () => {
			dispatch( dismiss( props.id ) );
		}, [] ),
		NotificationComponent = React.useMemo(
			() => notificationComponents[ props.ui ] || notificationComponents[ defaultNotification ],
			[ props.ui ]
		);

	return (
		<NotificationComponent onClose={ onCloseHandler } { ...props.componentProps } />
	);
}

Notification.propTypes = {
	id: PropTypes.string,
	ui: PropTypes.string,
	componentProps: PropTypes.object,
};
