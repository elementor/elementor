import React, { useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { ImportContext } from '../../../context/import-context/import-context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';

import PluginsToImport from './components/plugins-to-import/plugins-to-import';
import ExistingPlugins from './components/existing-plugins/existing-plugins';
import ProBanner from './components/pro-banner/pro-banner';
import ImportPluginsFooter from './components/import-plugins-footer/import-plugins-footer';
import Loader from '../../../ui/loader/loader';

import Notice from 'elementor-app/ui/molecules/notice';
import InlineLink from 'elementor-app/ui/molecules/inline-link';

import usePlugins from '../../../hooks/use-plugins';
import useImportPluginsData from './hooks/use-import-plugins-data';

import './import-plugins.scss';

export default function ImportPlugins() {
	const importContext = useContext( ImportContext ),
		navigate = useNavigate(),
		kitPlugins = importContext.data.uploadedData?.manifest?.plugins || [],
		{ pluginsState, pluginsActions, PLUGIN_STATUS_MAP } = usePlugins(),
		{ pluginsData } = useImportPluginsData( kitPlugins, pluginsState.data, PLUGIN_STATUS_MAP ),
		handleRequiredPlugins = () => {
			const { missing } = pluginsData;

			if ( missing.length ) {
				importContext.dispatch( { type: 'SET_REQUIRED_PLUGINS', payload: missing } );
			} else {
				// In case there are not required plugins just skipping to the next screen.
				navigate( 'import/content' );
			}
		},
		handleRefresh = () => {
			importContext.dispatch( { type: 'SET_REQUIRED_PLUGINS', payload: [] } );

			pluginsActions.get();
		},
		handleProInstallationStatus = () => {
			// In case that the Pro data is now exist but initially in the elementorAppConfig the value was false, it means that the pro was added during the process.
			if ( pluginsData.proData && ! elementorAppConfig.hasPro ) {
				importContext.dispatch( { type: 'SET_IS_PRO_INSTALLED_DURING_PROCESS', payload: true } );
			}
		},
		getPluginsToImport = () => {
			const { missing } = pluginsData || {};

			if ( ! missing || ! missing.length ) {
				return [];
			}

			const { name, status } = missing[ 0 ];

			// In case that Elementor Pro exist and is not inactive, it should be displayed separately.
			if ( 'Elementor Pro' === name && PLUGIN_STATUS_MAP.INACTIVE !== status ) {
				return missing.splice( 1 );
			}

			return missing;
		};

	// On load.
	useEffect( () => {
		if ( ! kitPlugins.length ) {
			navigate( 'import/content' );
		}
	}, [] );

	// On plugins data ready.
	useEffect( () => {
		if ( pluginsData && ! importContext.data.requiredPlugins.length ) {
			// Saving the required plugins to display them on the next screens.
			handleRequiredPlugins();

			// In case that the pro was installed in the middle of the process, the global state should be updated with the current status.
			handleProInstallationStatus();
		}
	}, [ pluginsData ] );

	return (
		<Layout type="export" footer={ <ImportPluginsFooter /> }>
			<section className="e-app-import-plugins">
				{ ! pluginsData && <Loader absoluteCenter />	}

				{
					! ! pluginsData?.missing.length &&
					<PageHeader
						heading={ __( 'Select the plugins you want to import', 'elementor' ) }
						description={ __( 'These are the plugins that powers up your kit. You can deselect them, but it can impact the functionality of your site.', 'elementor' ) }
					/>
				}

				{
					! ! pluginsData?.minVersionMissing.length &&
					<Notice label={ __( ' Recommended:', 'elementor' ) } className="e-app-import-plugins__versions-notice" color="warning">
						{ __( 'Head over to Updates and make sure that your plugins are updated to the latest version.', 'elementor' ) } <InlineLink url={ elementorAppConfig.admin_url + 'update-core.php' }>{ __( 'Take me there', 'elementor' ) }</InlineLink>
					</Notice>
				}

				{ pluginsData?.proData && <ProBanner status={ pluginsData.proData.status } onRefresh={ handleRefresh } /> }

				<PluginsToImport plugins={ getPluginsToImport() } />

				<ExistingPlugins plugins={ pluginsData?.existing } />
			</section>
		</Layout>
	);
}
