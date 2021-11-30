import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';

import PluginsSelection from '../../../shared/plugins-selection/plugins-selection';
import ProBanner from './components/pro-banner/pro-banner';

import Heading from 'elementor-app/ui/atoms/heading';
import Button from 'elementor-app/ui/molecules/button';
import Notice from 'elementor-app/ui/molecules/notice';
import InlineLink from 'elementor-app/ui/molecules/inline-link';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

import usePlugins from '../../../hooks/use-plugins';

import './import-plugins.scss';
export default function ImportPlugins() {
	const context = useContext( Context ),
		navigate = useNavigate(),
		{ pluginsState, pluginsActions, PLUGINS_STATUS_MAP } = usePlugins(),
		getPluginsInitialData = () => ( { toImport: [], existing: [], proPluginData: null, isMinVersionMissing: false } ),
		[ plugins, setPlugins ] = useState( getPluginsInitialData() ),
		kitPlugins = context.data.uploadedData?.manifest?.plugins,
		getInitialSelectAll = ( pluginsList ) => pluginsList.map( ( plugin, index ) => index ),
		handleOnSelect = ( selectedPlugins ) => context.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } ),
		arrayToObjectByKey = ( array = [], key ) => {
			const finalObject = {};

			array.forEach( ( item ) => finalObject[ item[ key ] ] = item );

			return finalObject;
		},
		getIsMinVersionMissing = ( kitPluginVersion, installedPluginVersion ) => {
			const kitVersionValues = kitPluginVersion.split( '.' ),
				installedVersionValues = installedPluginVersion.split( '.' );

			return installedVersionValues.some( ( value, index ) => value < kitVersionValues[ index ] );
		},
		getClassifiedPlugins = () => {
			const pluginsDataForActions = getPluginsInitialData(),
				installedPluginsMap = arrayToObjectByKey( pluginsState.data?.installed, 'name' );

			kitPlugins.forEach( ( plugin ) => {
				const installedPluginData = installedPluginsMap[ plugin.name ],
					actionType = 'active' === installedPluginData?.status ? 'existing' : 'toImport',
					pluginData = installedPluginData || { ...plugin, status: 'Not Installed' };

				// Verifying that the current installed plugin version is not older than the kit plugin version.
				if ( installedPluginData && getIsMinVersionMissing( plugin.version, installedPluginData.version ) ) {
					pluginsDataForActions.isMinVersionMissing = true;
				}

				// In case that the Pro is inactive or not installed, it should be displayed separately.
				if ( 'Elementor Pro' === pluginData.name && 'toImport' === actionType ) {
					pluginsDataForActions.proPluginData = pluginData;

					return;
				}

				pluginsDataForActions[ actionType ].push( pluginData );
			} );

			return pluginsDataForActions;
		},
		existingPluginsIndexes = getInitialSelectAll( plugins.existing ),
		saveRequiredPlugins = ( currentPlugins ) => {
			const { toImport, proPluginData } = currentPlugins,
				requiredPlugins = [ ...toImport ];

			if ( proPluginData ) {
				requiredPlugins.unshift( proPluginData );
			}

			context.dispatch( { type: 'SET_REQUIRED_PLUGINS', payload: requiredPlugins } );
		},
		isAllRequiredPluginsSelected = context.data.requiredPlugins.length === context.data.plugins.length,
		getFooter = () => (
			<WizardFooter separator justify="end">
				<Button
					text={ __( 'Previous', 'elementor' ) }
					variant="contained"
					onClick={ () => {
						context.dispatch( { type: 'SET_FILE', payload: null } );

						navigate( 'import/' );
					} }
				/>

				<Button
					variant="contained"
					text={ __( 'Next', 'elementor' ) }
					color="primary"
					onClick={ () => navigate( 'import/content' ) }
				/>
			</WizardFooter>
		);

	useEffect( () => {
		if ( kitPlugins ) {
			pluginsActions.get();
		} else {
			navigate( 'import/content' );
		}
	}, [] );

	useEffect( () => {
		if ( PLUGINS_STATUS_MAP.SUCCESS === pluginsState.status ) {
			const currentPlugins = getClassifiedPlugins();

			if ( currentPlugins.toImport.length || currentPlugins.proPluginData ) {
				saveRequiredPlugins( currentPlugins );

				setPlugins( currentPlugins );
			} else {
				// In case that are not plugins to import, navigating to the next screen.
				navigate( 'import/content' );
			}
		}
	}, [ pluginsState.status ] );

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-import-plugins">
				<PageHeader
					heading={ __( 'Select the plugins you want to import', 'elementor' ) }
					description={ __( 'These are the plugins that powers up your kit. You can deselect them, but it can impact the functionality of your site.', 'elementor' ) }
				/>

				{
					plugins.isMinVersionMissing &&
					<Notice label={ __( ' Recommended:', 'elementor' ) } className="e-app-import-plugins__versions-notice" color="warning">
						{ __( 'Please update your plugins before you importing the kit.', 'elementor' ) } <InlineLink>{ __( 'Show me how', 'elementor' ) }</InlineLink>
					</Notice>
				}

				{
					plugins.proPluginData?.status &&
					<ProBanner status={ plugins.proPluginData.status } />
				}

				{
					! ! plugins.toImport.length &&
					<div className="e-app-import-plugins__section">
						<Heading variant="h5" tag="h3" className="e-app-import-plugins__section-heading">
							{
								isAllRequiredPluginsSelected ?
								__( 'Plugins to add:', 'elementor' ) :
								__( 'Missing Required Plugins:', 'elementor' )
							}
						</Heading>

						<PluginsSelection
							plugins={ plugins.toImport }
							initialSelected={ getInitialSelectAll( plugins.toImport ) }
							onSelect={ handleOnSelect }
							layout={ [ 3, 1, 1 ] }
						/>
					</div>
				}

				{
					! ! plugins.existing.length &&
					<div className="e-app-import-plugins__section">
						<Heading variant="h5" tag="h3" className="e-app-import-plugins__section-heading">
							{ __( 'Plugins you already have:', 'elementor' ) }
						</Heading>

						<PluginsSelection
							withHeader={ false }
							withStatus={ false }
							plugins={ plugins.existing }
							initialSelected={ existingPluginsIndexes }
							initialDisabled={ existingPluginsIndexes }
							excludeSelections={ existingPluginsIndexes }
							layout={ [ 4, 1 ] }
						/>
					</div>
				}
			</section>
		</Layout>
	);
}
