import PropTypes from 'prop-types';
import Grid from 'elementor-app/ui/grid/grid';
import Card from './card';
import Button from './button';
import { OnboardingEventTracking } from '../utils/onboarding-event-tracking';
import { addExperimentTrackingToUrl } from '../utils/utils';

export default function GoodToGoContentExperiment401B( { skipButton } ) {
	const kitLibraryLink = elementorAppConfig.onboarding.urls.kitLibrary + '&referrer=onboarding';

	return (
		<>
			<h1 className="e-onboarding__page-content-section-title">
				{ __( 'Ready to build? Pick your starting point', 'elementor' ) }
			</h1>
			<Grid container alignItems="center" justify="space-between" className="e-onboarding__cards-grid e-onboarding__page-content">
				<Card
					name="blank"
					image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Blank_Canvas_401.svg' }
					imageAlt={ __( 'Click here to create a new page and open it in Elementor Editor', 'elementor' ) }
					title={ __( 'Blank Canvas', 'elementor' ) }
					text={ __( 'Start from scratch with the Elementor Editor', 'elementor' ) }
					link={ elementorAppConfig.onboarding.urls.createNewPage }
					clickAction={ () => {
						OnboardingEventTracking.handleSiteStarterChoice( 'blank_canvas' );
					} }
				/>
				<Card
					name="template"
					image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Library_401.svg' }
					imageAlt={ __( 'Click here to go to Elementor\'s Website Templates', 'elementor' ) }
					title={ __( 'Website Templates', 'elementor' ) }
					text={ __( 'Choose professionally-designed templates or import your own', 'elementor' ) }
					link={ kitLibraryLink }
					clickAction={ () => {
						OnboardingEventTracking.handleSiteStarterChoice( 'kit_library' );

						location.href = kitLibraryLink;
						location.reload();
					} }
				/>
				<Card
					name="site-planner"
					image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Site_Planner_401.svg' }
					imageAlt={ __( 'Click here to go to Elementor\'s Site Planner', 'elementor' ) }
					title={ __( 'AI Site Planner', 'elementor' ) }
					text={ __( 'Get a head start with AI-powered site planning', 'elementor' ) }
					link={ addExperimentTrackingToUrl( elementorAppConfig.onboarding.urls.sitePlanner, 'site-planner-step4' ) }
					target="_blank"
					clickAction={ () => {
						OnboardingEventTracking.handleSiteStarterChoice( 'site_planner' );
					} }
				/>
			</Grid>
			<Grid container alignItems="center" justify="space-between" className="e-onboarding__footer e-onboarding__good-to-go-footer">
				<div className="e-onboarding__switch-method-text">
					{ __( 'You can switch your method anytime', 'elementor' ) }
				</div>
				<Button
					buttonSettings={ {
						text: skipButton.text,
						href: skipButton.href,
						target: '_self',
					} }
					type="skip"
				/>
			</Grid>
		</>
	);
}

GoodToGoContentExperiment401B.propTypes = {
	skipButton: PropTypes.object.isRequired,
};

