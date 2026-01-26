import { Heading, Text, Grid, Button } from '@elementor/app-ui';
import PropTypes from 'prop-types';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';

export default function UpgradeMessage( { hasSubscription, isCloudKitsAvailable } ) {
	const showPlanUpgradeMessage = ! isCloudKitsAvailable && hasSubscription;

	const content = showPlanUpgradeMessage ? {
		heading: __( 'Access Website Templates with a plan upgrade', 'elementor' ),
		description: __( 'Your current plan doesn\'t include saving and importing Website Templates. Upgrade to the Advanced plan or higher to use this feature.', 'elementor' ),
		buttonText: __( 'Compare plans', 'elementor' ),
		url: 'https://go.elementor.com/go-pro-cloud-website-templates-library-advanced/',
	} : {
		heading: __( 'It\'s time to level up', 'elementor' ),
		description: __( 'Upgrade to Elementor Pro to import your own website template and save templates that you can reuse on any of your connected websites.', 'elementor' ),
		buttonText: __( 'Upgrade now', 'elementor' ),
		url: 'https://go.elementor.com/go-pro-cloud-website-templates-library/',
	};

	return (
		<Grid container alignItems="center" justify="center" direction="column" className="e-kit-library__error-screen">
			<i className="eicon-library-subscription-upgrade" aria-hidden="true"></i>
			<Heading
				tag="h3"
				variant="display-1"
				className="e-kit-library__error-screen-title"
			>
				{ content.heading }
			</Heading>
			<Text variant="xl" className="e-kit-library__error-screen-description">
				{ content.description }
			</Text>
			<Button
				text={ content.buttonText }
				url={ content.url }
				onClick={ () => {
					AppsEventTracking.sendKitsCloudUpgradeClicked( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.cloudKitLibrary );
				} }
				target="_blank"
				className="e-kit-library__upgrade-button"
			/>
		</Grid>
	);
}

UpgradeMessage.propTypes = {
	hasSubscription: PropTypes.bool.isRequired,
	isCloudKitsAvailable: PropTypes.bool.isRequired,
};
