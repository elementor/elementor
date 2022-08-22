import { useContext, useEffect, useMemo } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';
import { ImportContext } from '../../../context/import-context/import-context-provider';

import Layout from '../../../templates/layout';
import WizardStep from '../../../ui/wizard-step/wizard-step';
import KitData from '../../../shared/kit-data/kit-data';
import InlineLink from 'elementor-app/ui/molecules/inline-link';

import FailedPluginsNotice from './components/failed-plugins-notice/failed-plugins-notice';
import ConnectProNotice from './components/connect-pro-notice/connect-pro-notice';
import ImportCompleteFooter from './components/import-complete-footer/import-complete-footer';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import useImportedKitData from './hooks/use-imported-kit-data';

export default function ImportComplete() {
	const sharedContext = useContext( SharedContext ),
		importContext = useContext( ImportContext ),
		navigate = useNavigate(),
		{ importedPlugins, uploadedData, importedData, isProInstalledDuringProcess } = importContext.data || {},
		{ referrer } = sharedContext.data || {},
		{ getTemplates, getContent, getWPContent, getPlugins } = useImportedKitData(),
		{ activePlugins, failedPlugins } = getPlugins( importedPlugins ),
		{ elementorHomePageUrl, recentlyEditedElementorPageUrl } = importedData?.configData || {},
		seeItLiveUrl = elementorHomePageUrl || recentlyEditedElementorPageUrl || null,
		getKitData = () => {
			if ( ! uploadedData || ! importedData ) {
				return {};
			}

			const manifest = uploadedData.manifest;

			return {
				templates: getTemplates( manifest.templates, importedData ),
				content: getContent( manifest.content, importedData ),
				'wp-content': getWPContent( manifest[ 'wp-content' ], importedData ),
				'site-settings': sharedContext.data.includes.includes( 'settings' ) ? manifest[ 'site-settings' ] : {},
				plugins: activePlugins,
				configData: importedData.configData,
			};
		},
		eventTracking = ( command, source, eventType = 'click', elementLocation = null ) => {
			if ( 'kit-library' === referrer ) {
				appsEventTrackingDispatch(
					command,
					{
						page_source: source,
						event_type: eventType,
						element_location: elementLocation,
					},
				);
			}
		},
		kitData = useMemo( () => getKitData(), [] );

	useEffect( () => {
		if ( ! uploadedData ) {
			navigate( '/import' );
		}
		if ( uploadedData ) {
			eventTracking( 'kit-library/kit-is-live-load', 'kit is live', 'load' );
		}
		sharedContext.dispatch( { type: 'SET_CURRENT_PAGE_NAME', payload: ImportComplete.name } );
	}, [] );

	return (
		<Layout type="import" footer={ <ImportCompleteFooter seeItLiveUrl={ seeItLiveUrl } referrer={ referrer } /> }>
			<WizardStep
				image={ elementorAppConfig.assets_url + 'images/go-pro.svg' }
				heading={ __( 'Your kit is now live on your site!', 'elementor' ) }
				description={ __( 'You’ve imported and applied the following to your site:', 'elementor' ) }
				notice={ (
					<>
						<InlineLink
							url="https://go.elementor.com/app-what-are-kits"
							italic
							onClick={ () => eventTracking( 'kit-library/seek-more-info', 'kit is live', 'click', 'app_header' ) }
						>
							{ __( 'Click here', 'elementor' ) }
						</InlineLink> { __( 'to learn more about building your site with Elementor Kits', 'elementor' ) }
					</>
				) }
			>
				{ ! ! failedPlugins.length && <FailedPluginsNotice failedPlugins={ failedPlugins } /> }

				{ isProInstalledDuringProcess && <ConnectProNotice /> }

				<KitData data={ kitData } />
			</WizardStep>
		</Layout>
	);
}
