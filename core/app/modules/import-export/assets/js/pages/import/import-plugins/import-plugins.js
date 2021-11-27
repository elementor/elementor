import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';

import PluginsSelection from '../../../shared/plugins-selection/plugins-selection';
import ProBanner from './components/pro-banner/pro-banner';

import Heading from 'elementor-app/ui/atoms/heading';
import Button from 'elementor-app/ui/molecules/button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

import usePlugins from '../../../hooks/use-plugins';

import './import-plugins.scss';

export default function ImportPlugins() {
	const context = useContext( Context ),
		navigate = useNavigate(),
		{ pluginsState, pluginsActions, PLUGINS_STATUS_MAP } = usePlugins(),
		pluginsInitialState = {
			toImport: [],
			existing: [],
			isProExist: false,
		},
		[ plugins, setPlugins ] = useState( pluginsInitialState ),
		kitPlugins = context.data.uploadedData?.manifest?.plugins,
		getInitialSelectAll = ( pluginsList ) => pluginsList.map( ( plugin, index ) => index ),
		handleOnSelect = ( selectedPlugins ) => context.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } ),
		arrayToObjectByKey = ( array, key ) => {
			const finalObject = {};

			array.forEach( ( item ) => finalObject[ item[ key ] ] = item );

			return finalObject;
		},
		getClassifiedPlugins = () => {
			const pluginsForActions = { ...pluginsInitialState },
				installedPluginsMap = arrayToObjectByKey( pluginsState.data.installed, 'name' );

			kitPlugins.forEach( ( plugin ) => {
				if ( 'Elementor Pro' === plugin.name ) {
					pluginsForActions.isProExist = true;

					return;
				}

				const installedPluginData = installedPluginsMap[ plugin.name ];

				if ( ! installedPluginData ) {
					return;
				}

				const type = 'active' === installedPluginData?.status ? 'existing' : 'toImport';

				pluginsForActions[ type ].push( installedPluginData );
			} );

			return pluginsForActions;
		},
		existingPluginsIndexed = getInitialSelectAll( plugins.existing ),
		getFooter = () => (
			<WizardFooter separator justify="end">
				<Button text="Action" />
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
		if ( PLUGINS_STATUS_MAP.FETCHED === pluginsState.status ) {
			const currentPlugins = getClassifiedPlugins();

			if ( currentPlugins.toImport.length || currentPlugins.isProExist ) {
				setPlugins( currentPlugins );
			} else {
				// In case that are not plugins to import, navigating to the next screen.
				navigate( 'import/content' );
			}
		}
	}, [ pluginsState.status ] );

	useEffect( () => {
		console.log( '### plugins', plugins );
	}, [ plugins ] );

	console.log( '************************ plugins', plugins );

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-import-plugins">
				<PageHeader
					heading={ __( 'Select the plugins you want to import', 'elementor' ) }
					description={ __( 'These are the plugins that powers up your kit. You can deselect them, but it can impact the functionality of your site.', 'elementor' ) }
				/>

				{ plugins.isProExist && <ProBanner />	}

				{
					! ! plugins.toImport.length &&
					<div className="e-app-import-plugins__section">
						<Heading variant="h5" tag="h3" className="e-app-import-plugins__section-heading">{ __( 'Plugins to add:', 'elementor' ) }</Heading>

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
						<Heading variant="h5" tag="h3" className="e-app-import-plugins__section-heading">{ __( 'Plugins you already have:', 'elementor' ) }</Heading>

						<PluginsSelection
							withHeader={ false }
							withStatus={ false }
							plugins={ plugins.existing }
							initialSelected={ existingPluginsIndexed }
							initialDisabled={ existingPluginsIndexed }
							excludeSelections={ existingPluginsIndexed }
							layout={ [ 4, 1 ] }
						/>
					</div>
				}
			</section>
		</Layout>
	);
}
