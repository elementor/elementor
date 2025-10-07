import PropTypes from 'prop-types';
import Grid from 'elementor-app/ui/grid/grid';
import Card from './card';
import Button from './button';
import { OnboardingEventTracking } from '../utils/onboarding-event-tracking';

export default function GoodToGoContentB( { skipButton } ) {
	const kitLibraryLink = elementorAppConfig.onboarding.urls.kitLibrary + '&referrer=onboarding';

	const handleBlankCanvasClick = ( event ) => {
		OnboardingEventTracking.handleSiteStarterChoice( 'blank_canvas' );

		if ( skipButton.href ) {
			event.preventDefault();
			window.location.href = skipButton.href;
		}
	};

	return (
		<>
			<h1 className="e-onboarding__page-content-section-title">
				{ __( 'How would you like to create your website?', 'elementor' ) }
			</h1>
			<Grid container alignItems="center" justify="center" className="e-onboarding__cards-grid e-onboarding__page-content e-onboarding__cards-grid--good-to-go-variant-b">
				<Card
					name="template"
					image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Library.svg' }
					imageAlt={ __( 'Click here to go to Elementor\'s Website Templates', 'elementor' ) }
					text={ __( 'Choose a professionally-designed template or import your own', 'elementor' ) }
					link={ kitLibraryLink }
					clickAction={ () => {
						OnboardingEventTracking.handleSiteStarterChoice( 'kit_library' );

						location.href = kitLibraryLink;
						location.reload();
					} }
				/>
				<Card
					name="site-planner"
					image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Site_Planner.svg' }
					imageAlt={ __( 'Click here to go to Elementor\'s Site Planner', 'elementor' ) }
					text={ __( 'Create a professional site in minutes using AI', 'elementor' ) }
					link={ elementorAppConfig.onboarding.urls.sitePlanner }
					target="_blank"
					clickAction={ () => {
						OnboardingEventTracking.handleSiteStarterChoice( 'site_planner' );
					} }
				/>
			</Grid>
			<Grid container alignItems="center" justify="space-between" className="e-onboarding__footer e-onboarding__good-to-go-footer">
				<Button
					buttonSettings={ {
						text: skipButton.text,
						href: skipButton.href,
						target: '_self',
						onClick: handleBlankCanvasClick,
					} }
					type="skip"
				/>
			</Grid>
		</>
	);
}

GoodToGoContentB.propTypes = {
	skipButton: PropTypes.object.isRequired,
};
