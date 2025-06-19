import { Text, Button } from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import './envato-promotion.scss';

export default function EnvatoPromotion( props ) {
	const eventTracking = ( command, eventType = 'click' ) => {
		appsEventTrackingDispatch(
			command,
			{
				page_source: 'home page',
				element_position: 'library_bottom_promotion',
				category: props.category && ( '/favorites' === props.category ? 'favorites' : 'all kits' ),
				event_type: eventType,
			},
		);
	};

	return (
		<Text className="e-kit-library-promotion" variant="xl">
			{ __( 'Looking for more Website Templates?', 'elementor' ) } { ' ' }
			<Button
				variant="underlined"
				color="link"
				url="https://go.elementor.com/app-envato-kits/"
				target="_blank"
				rel="noreferrer"
				text={ __( 'Check out Elementor Website Templates on ThemeForest', 'elementor' ) }
				onClick={ () => eventTracking( 'kit-library/check-kits-on-theme-forest' ) }
			/>
		</Text>
	);
}
EnvatoPromotion.propTypes = {
	category: PropTypes.string,
};
