import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

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
import useImportPluginsData from '../../../hooks/use-import-plugins-data';

import './import-plugins.scss';

export default function ImportPlugins() {
	const context = useContext( Context ),
		navigate = useNavigate(),
		{ pluginsState, pluginsActions } = usePlugins(),
		kitPlugins = context.data.uploadedData?.manifest?.plugins || [],
		{ plugins } = useImportPluginsData( kitPlugins, pluginsState.data ),
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

	console.log( 'pluginsState', pluginsState );

	// On load.
	useEffect( () => {
		// TODO: uncomment
		if ( ! kitPlugins.length ) {
			navigate( 'import/content' );
		}
	}, [] );

	// On plugins data ready.
	// useEffect( () => {
	// 	if ( PLUGINS_STATUS_MAP.SUCCESS === pluginsStatus ) {
	// 		const classifiedPluginsData = getClassifiedPlugins();
	//
	// 		if ( classifiedPluginsData.toImport.length || classifiedPluginsData.proData ) {
	// 			// Saving the required plugins list for displaying it at the end of the process.
	// 			saveRequiredPlugins( classifiedPluginsData );
	//
	// 			setPlugins( classifiedPluginsData );
	// 		} else {
	// 			// In case that are not plugins to import, navigating to the next screen.
	// 			navigate( 'import/content' );
	// 		}
	// 	}
	// }, [ pluginsStatus ] );

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

				<PluginsToImport plugins={ plugins?.missing } />

				<ExistingPlugins plugins={ plugins?.existing } />
			</section>
		</Layout>
	);
}
