import { Text, Button } from '@elementor/app-ui';
import { eventTrackingDispatch } from 'elementor-app/event-track/events';

import './envato-promotion.scss';

export default function EnvatoPromotion( { category } ) {
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
				onClick={ () => eventTrackingDispatch(
					'kit-library/check-kits-on-theme-forest',
					{
						event: 'browse themeforest',
						source: 'home page',
						category: '/' === category ? 'all kits' : 'favorites',
					},
				) }
			/>
		</Text>
	);
}

EnvatoPromotion.propTypes = {
	category: PropTypes.string,
};
