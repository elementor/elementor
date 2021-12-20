import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';
import { ExportContext } from '../../../context/export-context/export-context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';

import ExportPluginsSelection from './components/export-plugins-selection/export-plugins-selection';

import Button from 'elementor-app/ui/molecules/button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

import './export-plugins.scss';

export default function ExportPlugins() {
	const sharedContext = useContext( SharedContext ),
		exportContext = useContext( ExportContext ),
		navigate = useNavigate(),
		[ isKitReady, setIsKitReady ] = useState( false ),
		{ plugins, isExportProcessStarted } = exportContext.data || [],
		hasIncludes = sharedContext.data.includes.length,
		getFooter = () => (
			<WizardFooter separator justify="end">
				<Button
					text={ __( 'Back', 'elementor' ) }
					variant="contained"
					url="/export"
				/>

				<Button
					text={ __( 'Create Kit', 'elementor' ) }
					variant="contained"
					color={ isKitReady ? 'primary' : 'disabled' }
					onClick={ () => isKitReady ? navigate( '/export/process' ) : null }
				/>
			</WizardFooter>
		),
		getPluginsForSelection = ( currentPlugins ) => {
			if ( currentPlugins.length && 'Elementor' === currentPlugins[ 0 ].name ) {
				return currentPlugins.splice( 1 );
			}

			return currentPlugins;
		},
		handlePluginsReady = ( activePlugins ) => {
			const pluginsForSelection = getPluginsForSelection( activePlugins );

			if ( ! hasIncludes && ! pluginsForSelection.length ) {
				// In case there are no kit-content items or plugins to export, going back to the main screen.
				navigate( '/export' );
			} else if ( ! pluginsForSelection.length ) {
				// In case there are no plugins to export, moving on to the next screen.
				navigate( '/export/process' );
			}
		};

	useEffect( () => {
		if ( ! isExportProcessStarted ) {
			// When not starting from the main screen.
			navigate( '/export' );
		} else if ( hasIncludes ) {
			// In case that the kit has content then the kit can be exported.
			setIsKitReady( true );
		}
	}, [] );

	useEffect( () => {
		// In case that the kit has no content, it can only be exported if there is at least one selected plugin.
		if ( ! hasIncludes ) {
			const selectedPlugins = getPluginsForSelection( plugins );

			setIsKitReady( ! ! selectedPlugins.length );
		}
	}, [ plugins ] );

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-export-plugins">
				<PageHeader
					heading={ __( 'Export your site as a Template Kit', 'elementor' ) }
					description={ __( 'Select which of these plugins are required for this kit work.', 'elementor' ) }
				/>

				<ExportPluginsSelection onPluginsReady={ handlePluginsReady } />
			</section>
		</Layout>
	);
}
