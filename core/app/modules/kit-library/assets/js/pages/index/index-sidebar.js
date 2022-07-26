import { MenuItem } from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

export default function IndexSidebar( props ) {
	const eventTracking = ( command, eventName, source ) => appsEventTrackingDispatch(
		command,
		{
			event: eventName,
			source,
		},
	);

	return (
		<>
			{
				props.menuItems.map( ( item ) => (
					<MenuItem
						key={ item.label }
						text={ item.label }
						className={ `eps-menu-item__link ${ item.isActive ? 'eps-menu-item--active' : '' }` }
						icon={ item.icon }
						url={ item.url }
						onClick={ () => eventTracking( item.trackEventData.action, item.trackEventData.event, 'home page' ) }
					/>
				) )
			}
			{ props.tagsFilterSlot }
		</>
	);
}

IndexSidebar.propTypes = {
	tagsFilterSlot: PropTypes.node,
	menuItems: PropTypes.arrayOf( PropTypes.shape( {
		label: PropTypes.string,
		icon: PropTypes.string,
		isActive: PropTypes.bool,
		url: PropTypes.string,
		onClick: PropTypes.func,
	} ) ),
};
