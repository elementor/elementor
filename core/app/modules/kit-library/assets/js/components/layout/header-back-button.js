import { Button } from '@elementor/app-ui';
import { useLastFilterContext } from '../../context/last-filter-context';
import { useNavigate } from '@reach/router';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import './header-back-button.scss';

export default function HeaderBackButton( { kitName, pageId } ) {
	const navigate = useNavigate(),
		{ lastFilter } = useLastFilterContext();
	const eventTracking = ( command ) => {
		appsEventTrackingDispatch(
			command,
			{
				source: pageId,
				kit_name: kitName,
				element_position: 'app_header',
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
