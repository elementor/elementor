import React, { useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { ImportContext } from '../../../context/import-context/import-context-provider';
import { SharedContext } from '../../../context/shared-context/shared-context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';

import PluginsToImport from './components/plugins-to-import/plugins-to-import';
import ExistingPlugins from './components/existing-plugins/existing-plugins';
import ProBanner from './components/pro-banner/pro-banner';
import ImportPluginsFooter from './components/import-plugins-footer/import-plugins-footer';
import Loader from '../../../ui/loader/loader';

import Notice from 'elementor-app/ui/molecules/notice';
import InlineLink from 'elementor-app/ui/molecules/inline-link';

import usePlugins, { PLUGIN_STATUS_MAP } from '../../../hooks/use-plugins';
import usePluginsData from '../../../hooks/use-plugins-data';
import useImportPluginsData from './hooks/use-import-plugins-data';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import './import-plugins.scss';

export default function ImportPlugins() {
	const importContext = useContext( ImportContext ),
		sharedContext = useContext( SharedContext ),
		navigate = useNavigate(),
		kitPlugins = importContext.data.uploadedData?.manifest?.plugins || [],
		{ response, pluginsActions } = usePlugins(),
		{ pluginsData } = usePluginsData( response.data ),
		{ importPluginsData } = useImportPluginsData( kitPlugins, pluginsData ),
		{ missing, existing, minVersionMissing, proData } = importPluginsData || {},
		{ referrer, currentPage } = sharedContext.data || {},
		handleRequiredPlugins = () => {
			if ( missing.length ) {
				// Saving globally the plugins data that the kit requires in order to work properly.
				importContext.dispatch( { type: 'SET_REQUIRED_PLUGINS', payload: missing } );
			}
		},
		handleRefresh = () => {
			importContext.dispatch( { type: 'SET_REQUIRED_PLUGINS', payload: [] } );

			pluginsActions.fetch();
		},
		handleProInstallationStatus = () => {
			// In case that the Pro data is now exist but initially in the elementorAppConfig the value was false, it means that the pro was added during the process.
			if ( proData && ! elementorAppConfig.hasPro ) {
				importContext.dispatch( { type: 'SET_IS_PRO_INSTALLED_DURING_PROCESS', payload: true } );
			}
		},
		eventTracking = ( command ) => {
			if ( 'kit-library' === referrer ) {
				appsEventTrackingDispatch(
					command,
					{
						page_source: 'import',
						step: currentPage,
						event_type: 'click',
					},
				);
			}
		};

	// On load.
	useEffect( () => {
		if ( ! kitPlugins.length ) {
			navigate( 'import/content' );
		}
		sharedContext.dispatch( { type: 'SET_CURRENT_PAGE_NAME', payload: ImportPlugins.name } );
	}, [] );

	// On plugins data ready.
	useEffect( () => {
		if ( importPluginsData && ! importContext.data.requiredPlugins.length ) {
			// Saving the required plugins to display them on the next screens.
			handleRequiredPlugins();

			// In case that the pro was installed in the middle of the process, the global state should be updated with the current status.
			handleProInstallationStatus();
		}
	}, [ importPluginsData ] );

	return (
		<Layout type="import" footer={ <ImportPluginsFooter
			onPreviousClick={ () => eventTracking( 'kit-library/go-back' ) }
			onNextClick={ () => eventTracking( 'kit-library/approve-selection' ) }
		/> } >
			<section className="e-app-import-plugins">
				{ ! importPluginsData && <Loader absoluteCenter />	}

				<PageHeader
					heading={ __( 'Select the plugins you want to import', 'elementor' ) }
					description={ __( 'These are the plugins that powers up your kit. You can deselect them, but it can impact the functionality of your site.', 'elementor' ) }
				/>

				{
					! ! minVersionMissing?.length &&
					<Notice label={ __( ' Recommended:', 'elementor' ) } className="e-app-import-plugins__versions-notice" color="warning">
						{ __( 'Head over to Updates and make sure that your plugins are updated to the latest version.', 'elementor' ) } <InlineLink url={ elementorAppConfig.admin_url + 'update-core.php' }>{ __( 'Take me there', 'elementor' ) }</InlineLink>
					</Notice>
				}

				{ PLUGIN_STATUS_MAP.NOT_INSTALLED === proData?.status && <ProBanner onRefresh={ handleRefresh } /> }

				<PluginsToImport plugins={ missing } />

				<ExistingPlugins plugins={ existing } />
			</section>
		</Layout>
	);
}
