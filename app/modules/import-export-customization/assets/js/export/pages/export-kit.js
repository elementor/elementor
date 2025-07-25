import { useEffect } from 'react';
import { Box } from '@elementor/ui';

import { BaseLayout, TopBar, Footer, PageHeader } from '../../shared/components';
import ExportIntro from '../components/export-intro';
import ExportKitFooter from '../components/export-kit-footer';
import KitContent from '../components/export-kit-parts-selection';
import KitInfo from '../components/kit-info';
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';

export default function ExportKit() {
	const footerContent = <ExportKitFooter />;

	const headerContent = (
		<PageHeader title={ __( 'Export', 'elementor' ) } />
	);

	useEffect( () => {
		AppsEventTracking.sendPageViewsWebsiteTemplates( elementorCommon.editorEvents.config.secondaryLocations.kitLibrary.kitExportCustomization );
	}, [] );

	return (
		<BaseLayout
			topBar={ <TopBar>{ headerContent }</TopBar> }
			footer={ <Footer>{ footerContent }</Footer> }
		>
			<Box sx={ { p: 3, mb: 2, maxWidth: '1075px', mx: 'auto' } }>
				<ExportIntro />
				<KitInfo />
				<KitContent />
			</Box>
		</BaseLayout>
	);
}
