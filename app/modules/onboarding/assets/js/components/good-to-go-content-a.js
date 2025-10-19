import PropTypes from 'prop-types';
import Grid from 'elementor-app/ui/grid/grid';
import Card from './card';
import FooterButtons from './layout/footer-buttons';
import { OnboardingEventTracking } from '../utils/onboarding-event-tracking';
import { addExperimentTrackingToUrl } from '../utils/utils';

export default function GoodToGoContentA( { skipButton } ) {
	const kitLibraryLink = elementorAppConfig.onboarding.urls.kitLibrary + '&referrer=onboarding';

	return (
		<>
			<h1 className="e-onboarding__page-content-section-title">
				{ elementorAppConfig.onboarding.experiment
					? __( 'Welcome aboard! What\'s next?', 'elementor' )
					: __( 'That\'s a wrap! What\'s next?', 'elementor' ) }
			</h1>
			<div className="e-onboarding__page-content-section-text">
				{ __( 'There are three ways to get started with Elementor:', 'elementor' ) }
			</div>
			<Grid container alignItems="center" justify="space-between" className="e-onboarding__cards-grid e-onboarding__page-content">
				<Card
					name="blank"
					image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Blank_Canvas.svg' }
					imageAlt={ __( 'Click here to create a new page and open it in Elementor Editor', 'elementor' ) }
					text={ __( 'Edit a blank canvas with the Elementor Editor', 'elementor' ) }
					link={ elementorAppConfig.onboarding.urls.createNewPage }
					clickAction={ () => {
						OnboardingEventTracking.handleSiteStarterChoice( 'blank_canvas' );
					} }
				/>
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
					link={ addExperimentTrackingToUrl( elementorAppConfig.onboarding.urls.sitePlanner, 'site-planner-step4' ) }
					target="_blank"
					clickAction={ () => {
						OnboardingEventTracking.handleSiteStarterChoice( 'site_planner' );
					} }
				/>
			</Grid>
			<FooterButtons skipButton={ { ...skipButton, target: '_self' } } className="e-onboarding__good-to-go-footer" />
		</>
	);
}

GoodToGoContentA.propTypes = {
	skipButton: PropTypes.object.isRequired,
};
