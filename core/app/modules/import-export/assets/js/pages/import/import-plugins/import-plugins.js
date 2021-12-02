import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { arrayToObjectByKey } from 'elementor-app/utils/utils.js';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';

import PluginsToImport from './components/plugins-to-import/plugins-to-import';
import ExistingPlugins from './components/existing-plugins/existing-plugins';
import ProBanner from './components/pro-banner/pro-banner';
import ImportPluginsFooter from './components/import-plugins-footer/import-plugins-footer';

import Notice from 'elementor-app/ui/molecules/notice';
import InlineLink from 'elementor-app/ui/molecules/inline-link';

import usePlugins from '../../../hooks/use-plugins';

import './import-plugins.scss';

const PLUGINS_TO_IMPORT_KEY = 'toImport',
	EXISTING_PLUGINS_KEY = 'existing',
	ELEMENTOR_PRO_PLUGIN_KEY = 'Elementor Pro';

export default function ImportPlugins() {
	const context = useContext( Context ),
		navigate = useNavigate(),
		{ pluginsState, pluginsActions, PLUGINS_STATUS_MAP } = usePlugins(),
		kitPlugins = context.data.uploadedData?.manifest?.plugins,
		getPluginsInitialData = () => ( {
			toImport: [],
			existing: [],
			minVersionMissing: [],
			proPluginData: null,
		} ),
		[ plugins, setPlugins ] = useState( getPluginsInitialData() ),
		getIsMinVersionMissing = ( kitPluginVersion, installedPluginVersion ) => {
			const kitVersionValues = kitPluginVersion.split( '.' ),
				installedVersionValues = installedPluginVersion.split( '.' );

			return installedVersionValues.some( ( value, index ) => value < kitVersionValues[ index ] );
		},
		getClassifiedPlugins = () => {
			const pluginsData = getPluginsInitialData(),
				installedPluginsMap = arrayToObjectByKey( pluginsState.data, 'name' );

			kitPlugins.forEach( ( plugin ) => {
				const installedPluginData = installedPluginsMap[ plugin.name ],
					actionType = 'active' === installedPluginData?.status ? EXISTING_PLUGINS_KEY : PLUGINS_TO_IMPORT_KEY,
					pluginData = installedPluginData || { ...plugin, status: 'Not Installed' };

				// Verifying that the current installed plugin version is not older than the kit plugin version.
				if ( installedPluginData && getIsMinVersionMissing( plugin.version, installedPluginData.version ) ) {
					pluginsData.minVersionMissing.push( plugin );
				}

				// In case that the Pro is inactive or not installed, it should be displayed separately and therefore not included.
				if ( ELEMENTOR_PRO_PLUGIN_KEY === pluginData.name && PLUGINS_TO_IMPORT_KEY === actionType ) {
					pluginsData.proPluginData = pluginData;

					return;
				}

				pluginsData[ actionType ].push( pluginData );
			} );

			return pluginsData;
		},
		saveRequiredPlugins = ( classifiedPluginsData ) => {
			const { toImport, proPluginData } = classifiedPluginsData,
				requiredPlugins = [ ...toImport ];

			if ( proPluginData ) {
				requiredPlugins.unshift( proPluginData );
			}

			context.dispatch( { type: 'SET_REQUIRED_PLUGINS', payload: requiredPlugins } );
		};

	// On load.
	useEffect( () => {
		if ( kitPlugins ) {
			pluginsActions.get();
		} else {
			navigate( 'import/content' );
		}
	}, [] );

	// On plugins data ready.
	useEffect( () => {
		if ( PLUGINS_STATUS_MAP.SUCCESS === pluginsState.status ) {
			const classifiedPluginsData = getClassifiedPlugins();

			if ( classifiedPluginsData.toImport.length || classifiedPluginsData.proPluginData ) {
				// Saving the required plugins list for displaying it at the end of the process.
				saveRequiredPlugins( classifiedPluginsData );

				setPlugins( classifiedPluginsData );
			} else {
				// In case that are not plugins to import, navigating to the next screen.
				navigate( 'import/content' );
			}
		}
	}, [ pluginsState.status ] );

	return (
		<Layout type="export" footer={ <ImportPluginsFooter /> }>
			<section className="e-app-import-plugins">
				<PageHeader
					heading={ __( 'Select the plugins you want to import', 'elementor' ) }
					description={ __( 'These are the plugins that powers up your kit. You can deselect them, but it can impact the functionality of your site.', 'elementor' ) }
				/>

				{
					! ! plugins.minVersionMissing.length &&
					<Notice label={ __( ' Recommended:', 'elementor' ) } className="e-app-import-plugins__versions-notice" color="warning">
						{ __( 'Please update your plugins before you importing the kit.', 'elementor' ) } <InlineLink>{ __( 'Show me how', 'elementor' ) }</InlineLink>
					</Notice>
				}

				{ plugins.proPluginData?.status && <ProBanner status={ plugins.proPluginData.status } /> }

				{ ! ! plugins.toImport.length && <PluginsToImport plugins={ plugins.toImport } /> }

				{ ! ! plugins.existing.length && <ExistingPlugins plugins={ plugins.existing } /> }
			</section>
		</Layout>
	);
}
