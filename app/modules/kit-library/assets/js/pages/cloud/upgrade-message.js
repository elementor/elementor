import { useMemo } from 'react';
import { Heading, Text, Grid, Button } from '@elementor/app-ui';
import PropTypes from 'prop-types';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';

const UPGRADE_URLS = {
	ADVANCED_PLAN: 'https://go.elementor.com/go-pro-cloud-website-templates-library-advanced/',
	GO_PRO: 'https://go.elementor.com/go-pro-cloud-website-templates-library/',
};

const WEBSITE_TEMPLATE_DESCRIPTION = __( 'Save your entire website as a Website Template - including content, global styles, settings, and media - and reuse it across your connected sites.', 'elementor' );

const WEBSITE_TEMPLATE_AVAILABILITY_NOTE = __( 'Available on selected plans. Website Templates are different from Cloud Templates, which are used for individual design elements rather than complete websites.', 'elementor' );

export default function UpgradeMessage( { hasSubscription, isCloudKitsAvailable } ) {
	const showPlanUpgradeMessage = ! isCloudKitsAvailable && hasSubscription;

	const content = useMemo( () => showPlanUpgradeMessage ? {
		heading: __( 'Website Templates aren\'t included in your plan', 'elementor' ),
		description: WEBSITE_TEMPLATE_DESCRIPTION,
		buttonText: __( 'View upgrade options', 'elementor' ),
		note: WEBSITE_TEMPLATE_AVAILABILITY_NOTE,
		url: UPGRADE_URLS.ADVANCED_PLAN,
	} : {
		heading: __( 'Save and reuse complete websites', 'elementor' ),
		description: WEBSITE_TEMPLATE_DESCRIPTION,
		buttonText: __( 'See plans', 'elementor' ),
		note: WEBSITE_TEMPLATE_AVAILABILITY_NOTE,
		url: UPGRADE_URLS.GO_PRO,
	}, [ showPlanUpgradeMessage ] );

	return (
		<Grid container alignItems="center" justify="center" direction="column" className="e-kit-library__error-screen e-kit-library__error-screen--upgrade">
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
			<p className="e-kit-library__error-screen-note">
				{ content.note }
			</p>
		</Grid>
	);
}

UpgradeMessage.propTypes = {
	hasSubscription: PropTypes.bool.isRequired,
	isCloudKitsAvailable: PropTypes.bool.isRequired,
};
