import { Text, Button } from '@elementor/app-ui';

import './envato-promotion.scss';

export default function EnvatoPromotion() {
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
			/>
		</Text>
	);
}
