import { useSelector, useModulesSelectors } from '@elementor/store';
import Notification from '../molecules/notification';

export default function NotificationCenter() {
	const { active: activeSelector } = useModulesSelectors( 'notifications' ),
		active = useSelector( activeSelector );

	return active.map( ( notification ) => {
		return <Notification
			key={ notification.id }
			id={ notification.id }
			ui={ notification.ui }
			componentProps={ notification.props }
		/>;
	} );
}
