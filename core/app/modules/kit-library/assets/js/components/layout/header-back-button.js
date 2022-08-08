import { Button } from '@elementor/app-ui';
import { useLastFilterContext } from '../../context/last-filter-context';
import { useNavigate } from '@reach/router';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import './header-back-button.scss';

export default function HeaderBackButton( props ) {
	const navigate = useNavigate(),
		{ lastFilter } = useLastFilterContext(),
		eventTracking = ( command, eventType = 'click' ) => {
			appsEventTrackingDispatch(
				command,
				{
					page_source: props.pageId,
					kit_name: props.kitName,
					element_position: 'app_header',
					event_type: eventType,
				},
			);
		};
	return (
		<div className="e-kit-library__header-back-container">
			<Button
				className="e-kit-library__header-back"
				icon="eicon-chevron-left"
				text={ __( 'Back to Library', 'elementor' ) }
				onClick={ () => {
					eventTracking( 'kit-library/back-to-library' );
					navigate( wp.url.addQueryArgs( '/kit-library', lastFilter ) );
				} }
			/>
		</div>
	);
}

HeaderBackButton.propTypes = {
	pageId: PropTypes.string.isRequired,
	kitName: PropTypes.string.isRequired,
};
