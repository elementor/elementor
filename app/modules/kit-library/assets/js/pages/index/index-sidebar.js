import { MenuItem } from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

export default function IndexSidebar( props ) {
	const eventTracking = ( command, category, source, eventType = 'click' ) => appsEventTrackingDispatch(
		command,
		{
			category,
			source,
			element_location: 'app_sidebar',
			event_type: eventType,
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
						onClick={ () => eventTracking( item.trackEventData.command, item.trackEventData.category, 'home page' ) }
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
	} ) ),
};
