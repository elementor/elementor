import React, { useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';

import PluginsToImport from './components/plugins-to-import/plugins-to-import';
import ExistingPlugins from './components/existing-plugins/existing-plugins';
import ProBanner from './components/pro-banner/pro-banner';
import ImportPluginsFooter from './components/import-plugins-footer/import-plugins-footer';
import Loader from '../../../ui/loader/loader';

import Notice from 'elementor-app/ui/molecules/notice';
import InlineLink from 'elementor-app/ui/molecules/inline-link';

import useImportPluginsData from './hooks/use-import-plugins-data';

import './import-plugins.scss';

export default function ImportPlugins() {
	const context = useContext( Context ),
		navigate = useNavigate(),
		kitPlugins = context.data.uploadedData?.manifest?.plugins || [],
		{ plugins, pluginsActions } = useImportPluginsData( kitPlugins ),
		handleRequiredPlugins = () => {
			const { missing } = plugins;

			if ( missing.length ) {
				context.dispatch( { type: 'SET_REQUIRED_PLUGINS', payload: missing } );
			} else {
				// In case there are not required plugins just skipping to the next screen.
				navigate( 'import/content' );
			}
		},
		handleRefresh = () => {
			context.dispatch( { type: 'SET_REQUIRED_PLUGINS', payload: [] } );

			pluginsActions.get();
		},
		handleProInstallationStatus = () => {
			// In case that the Pro data is now exist but initially in the elementorAppConfig the value was false, it means that the pro was added during the process.
			if ( plugins.proData && ! elementorAppConfig.hasPro ) {
				context.dispatch( { type: 'SET_IS_PRO_INSTALLED_DURING_PROCESS', payload: true } );
			}
		};

	// On load.
	useEffect( () => {
		if ( ! kitPlugins.length ) {
			navigate( 'import/content' );
		}
	}, [] );

	// On plugins data ready.
	useEffect( () => {
		if ( plugins && ! context.data.requiredPlugins.length ) {
			// Saving the required plugins to display them on the next screens.
			handleRequiredPlugins();

			// In case that the pro was installed in the middle of the process, the global state should be updated with the current status.
			handleProInstallationStatus();
		}
	}, [ plugins ] );

	return (
		<Layout type="export" footer={ <ImportPluginsFooter /> }>
			<section className="e-app-import-plugins">
				{ ! plugins && <Loader absoluteCenter />	}

				{
					! ! plugins?.missing.length &&
					<PageHeader
						heading={ __( 'Select the plugins you want to import', 'elementor' ) }
						description={ __( 'These are the plugins that powers up your kit. You can deselect them, but it can impact the functionality of your site.', 'elementor' ) }
					/>
				}

				{
					! ! plugins?.minVersionMissing.length &&
					<Notice label={ __( ' Recommended:', 'elementor' ) } className="e-app-import-plugins__versions-notice" color="warning">
						{ __( 'Head over to Updates and make sure that your plugins are updated to the latest version.', 'elementor' ) } <InlineLink url={ elementorAppConfig.admin_url + 'update-core.php' }>{ __( 'Take me there', 'elementor' ) }</InlineLink>
					</Notice>
				}

				{ plugins?.proData && <ProBanner status={ plugins.proData.status } onRefresh={ handleRefresh } /> }

				<PluginsToImport plugins={ plugins?.missing } />

				<ExistingPlugins plugins={ plugins?.existing } />
			</section>
		</Layout>
	);
}
