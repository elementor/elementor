import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Content from '../../../../../../assets/js/layout/content';
import IndexHeader from '../index/index-header';
import IndexSidebar from '../index/index-sidebar';
import Layout from '../../components/layout';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import UpgradeMessage from './upgrade-message';

export default function UpgradeScreen( {
	menuItems,
	forceRefetch,
	isFetching,
	cloudKitsData,
} ) {
	const hasSubscription = '' !== cloudKitsData?.subscription_id;
	const isCloudKitsAvailable = cloudKitsData?.is_eligible ?? false;

	useEffect( () => {
		AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.eventsManager.config.secondaryLocations.kitLibrary.cloudKitLibraryUpgrade );
	}, [] );

	return (
		<Layout
			sidebar={
				<IndexSidebar menuItems={ menuItems } />
			}
			header={
				<IndexHeader
					refetch={ () => {
						forceRefetch();
					} }
					isFetching={ isFetching }
				/>
			}
		>
			<div className="e-kit-library__index-layout-container">
				<Content className="e-kit-library__index-layout-main e-kit-library__connect-container">
					<UpgradeMessage
						hasSubscription={ hasSubscription }
						isCloudKitsAvailable={ isCloudKitsAvailable }
					/>
				</Content>
			</div>
		</Layout>
	);
}

UpgradeScreen.propTypes = {
	menuItems: PropTypes.array.isRequired,
	forceRefetch: PropTypes.func.isRequired,
	isFetching: PropTypes.bool.isRequired,
	cloudKitsData: PropTypes.object.isRequired,
};
