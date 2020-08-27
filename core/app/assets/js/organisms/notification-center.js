import { useSelector } from '@elementor/store';
import Notification from '../molecules/notification';

export default function NotificationCenter() {
	const active = useSelector( ( state ) => state.notifications.active );

	return active.map( ( notification ) => {
		return <Notification
			key={ notification.id }
			id={ notification.id }
			ui={ notification.ui }
			componentProps={ notification.props }
		/>;
	} );
}
