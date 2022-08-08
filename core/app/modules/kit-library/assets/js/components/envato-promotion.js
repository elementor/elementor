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
		<Text className="e-kit-library-bottom-promotion" variant="xl">
			{ __( 'Looking for more Kits?', 'elementor' ) } { ' ' }
			<Button
				variant="underlined"
				color="link"
				url="https://go.elementor.com/app-envato-kits/"
				target="_blank"
				rel="noreferrer"
<<<<<<< HEAD
				text={ __( 'Check out Elementor Website Kits on ThemeForest', 'elementor' ) }
=======
				text={ __( 'Check out Elementor Template Kits on ThemeForest', 'elementor' ) }
				onClick={ () => eventTracking( 'kit-library/check-kits-on-theme-forest' ) }
>>>>>>> 4f8477b5ab9ad95bf6da1eb5011246fb9745de0f
			/>
		</Text>
	);
}
 EnvatoPromotion.propTypes = {
	category: PropTypes.string,
 };
