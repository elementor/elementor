import { Grid } from '@elementor/app-ui';
import HeaderButtons from '../../../../../../assets/js/layout/header-buttons';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

export default function Header( props ) {
	const eventTracking = ( command, source = 'home page', kitName = null, eventType = 'click' ) => appsEventTrackingDispatch(
			command,
			{
				page_source: source,
				element_position: 'app_header',
				kit_name: kitName,
				event_type: eventType,
			},
		),
		onClose = () => {
			eventTracking( 'kit-library/close', props?.pageId, props?.kitName );
			window.top.location = elementorAppConfig.admin_url;
		};

	return (
		<Grid container alignItems="center" justify="space-between" className="eps-app__header">
			{ props.startColumn || <a
				className="eps-app__logo-title-wrapper"
				href="#/kit-library"
				onClick={ () => eventTracking( 'kit-library/logo' ) }
			>
				<i className="eps-app__logo eicon-elementor" />
				<h1 className="eps-app__title">{ __( 'Kit Library', 'elementor' ) }</h1>
			</a> }
			{ props.centerColumn || <span /> }
			{ props.endColumn || <div style={ { flex: 1 } }>
				<HeaderButtons buttons={ props.buttons } onClose={ onClose } />
			</div> }
		</Grid>
	);
}

Header.propTypes = {
	startColumn: PropTypes.node,
	endColumn: PropTypes.node,
	centerColumn: PropTypes.node,
	buttons: PropTypes.arrayOf( PropTypes.object ),
	kitName: PropTypes.string,
	pageId: PropTypes.string,
};
