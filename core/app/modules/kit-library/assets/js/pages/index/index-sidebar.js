import { MenuItem } from '@elementor/app-ui';
import { eventTrackingDispatch } from 'elementor-app/event-track/events';

export default function IndexSidebar( props ) {
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
						onClick={ () => eventTrackingDispatch(
								item.trackEventData.action,
								{
									event: item.trackEventData.event,
									source: 'home page',
								},
							)
						}
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
