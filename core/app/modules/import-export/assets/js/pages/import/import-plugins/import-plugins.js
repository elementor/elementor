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

const MISSING_PLUGINS_KEY = 'missing',
	EXISTING_PLUGINS_KEY = 'existing',
	ELEMENTOR_PRO_PLUGIN_KEY = 'Elementor Pro';

export default function ImportPlugins() {
	const context = useContext( Context ),
		navigate = useNavigate(),
		{ pluginsData, pluginsStatus, pluginsActions } = usePlugins(),
		kitPlugins = context.data.uploadedData?.manifest?.plugins || [],
		getIsMinVersionExist = ( installedPluginVersion, kitPluginVersion ) => installedPluginVersion.localeCompare( kitPluginVersion ) > -1,
		getClassifiedPlugins = () => {
			const data = {
					missing: [],
					existing: [],
					minVersionMissing: [],
					proData: null,
				},
				installedPluginsMap = arrayToObjectByKey( pluginsData, 'name' );

			console.log( '' );
			console.log( 'kitPlugins', kitPlugins );
			console.log( 'installedPluginsMap', installedPluginsMap );
			console.log( '' );

			kitPlugins.forEach( ( plugin ) => {
				const installedPluginData = installedPluginsMap[ plugin.name ],
					group = 'active' === installedPluginData?.status ? EXISTING_PLUGINS_KEY : MISSING_PLUGINS_KEY,
					pluginData = installedPluginData || { ...plugin, status: 'Not Installed' };

				// Verifying that the current installed plugin version is not older than the kit plugin version.
				if ( installedPluginData && ! getIsMinVersionExist( installedPluginData.version, plugin.version ) ) {
					data.minVersionMissing.push( plugin );
				}

				// In case that the Pro is inactive or not installed, it should be displayed separately and therefore not included.
				if ( ELEMENTOR_PRO_PLUGIN_KEY === pluginData.name && ( MISSING_PLUGINS_KEY === group || ! elementorAppConfig.is_license_connected ) ) {
					data.proData = pluginData;

					return;
				}

				data[ group ].push( pluginData );
			} );

			return data;
		},
		plugins = getClassifiedPlugins(),
		saveRequiredPlugins = ( classifiedPluginsData ) => {
			// const { toImport, proData } = classifiedPluginsData,
			// 	requiredPlugins = [ ...toImport ];
			//
			// if ( proData ) {
			// 	requiredPlugins.unshift( proData );
			// }
			//
			// context.dispatch( { type: 'SET_REQUIRED_PLUGINS', payload: requiredPlugins } );
		};

	// On load.
	useEffect( () => {
		// TODO: uncomment
		if ( ! kitPlugins.length ) {
			navigate( 'import/content' );
		}
	}, [] );

	// On plugins data ready.
	useEffect( () => {
		// if ( PLUGINS_STATUS_MAP.SUCCESS === pluginsStatus ) {
		// 	const classifiedPluginsData = getClassifiedPlugins();
		//
		// 	if ( classifiedPluginsData.toImport.length || classifiedPluginsData.proData ) {
		// 		// Saving the required plugins list for displaying it at the end of the process.
		// 		saveRequiredPlugins( classifiedPluginsData );
		//
		// 		setPlugins( classifiedPluginsData );
		// 	} else {
		// 		// In case that are not plugins to import, navigating to the next screen.
		// 		navigate( 'import/content' );
		// 	}
		// }
	}, [ pluginsStatus ] );

	if ( pluginsData ) {
		pluginsData.forEach( ( plugin ) => {
			const group = 'active' === plugin.status ? 'existing' : 'missing';

			plugins[ group ].push( plugin );
		} );
	}

	console.log( 'final plugins: ', plugins );

	return (
		<Layout type="export" footer={ <ImportPluginsFooter /> }>
			<section className="e-app-import-plugins">
				<PageHeader
					heading={ __( 'Select the plugins you want to import', 'elementor' ) }
					description={ __( 'These are the plugins that powers up your kit. You can deselect them, but it can impact the functionality of your site.', 'elementor' ) }
				/>

				{
					false && ! ! plugins.minVersionMissing.length &&
					<Notice label={ __( ' Recommended:', 'elementor' ) } className="e-app-import-plugins__versions-notice" color="warning">
						{ __( 'Please update your plugins before you importing the kit.', 'elementor' ) } <InlineLink>{ __( 'Show me how', 'elementor' ) }</InlineLink>
					</Notice>
				}

				{ false && plugins.proData?.status && <ProBanner status={ plugins.proData.status } /> }

				{ ! ! plugins.missing.length && <PluginsToImport plugins={ plugins.missing } /> }

				{ ! ! plugins.existing.length && <ExistingPlugins plugins={ plugins.existing } /> }
			</section>
		</Layout>
	);
}
