import { Text, Button } from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import './envato-promotion.scss';

export default function EnvatoPromotion( { category } ) {
	const eventTracking = ( command ) => {
		appsEventTrackingDispatch(
			command,
			{
				source: 'home page',
				element_position: 'library_bottom_promotion',
				category: category && ( '/favorites' === category ? 'favorites' : 'all kits' ),
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
				text={ __( 'Check out Elementor Website Kits on ThemeForest', 'elementor' ) }
				onClick={ () => eventTracking( 'kit-library/check-kits-on-theme-forest' ) }
			/>
		</Text>
	);
}

EnvatoPromotion.propTypes = {
	category: PropTypes.string,
};
