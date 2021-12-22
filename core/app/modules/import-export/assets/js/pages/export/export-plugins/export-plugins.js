import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';
import { ExportContext } from '../../../context/export-context/export-context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ActionsFooter from '../../../shared/actions-footer/actions-footer';

import ExportPluginsSelection from './components/export-plugins-selection/export-plugins-selection';

import Button from 'elementor-app/ui/molecules/button';

import './export-plugins.scss';

export default function ExportPlugins() {
	const sharedContext = useContext( SharedContext ),
		exportContext = useContext( ExportContext ),
		navigate = useNavigate(),
		[ isKitReady, setIsKitReady ] = useState( false ),
		{ plugins, isExportProcessStarted } = exportContext.data || [],
		hasIncludes = ! ! sharedContext.data.includes.length,
		getFooter = () => (
			<ActionsFooter>
				<Button
					text={ __( 'Back', 'elementor' ) }
					variant="contained"
					url="/export"
				/>

				<Button
					text={ __( 'Create Kit', 'elementor' ) }
					variant="contained"
					color={ isKitReady ? 'primary' : 'disabled' }
					onClick={ () => isKitReady && navigate( '/export/process' ) }
				/>
			</ActionsFooter>
		);

	// On load.
	useEffect( () => {
		if ( ! isExportProcessStarted ) {
			// When not starting from the main screen.
			navigate( '/export' );
		}
	}, [] );

	// On plugins change.
	useEffect( () => {
		if ( hasIncludes ) {
			// In case that the kit has content then the kit can be exported.
			setIsKitReady( true );
		} else {
			// There should be at least one more plugin select in addition to Elementor Core.
			const isExportKitAllowed = plugins.length > 1;

			// In case that the kit has no content, it can only be exported if there is at least one selected plugin.
			setIsKitReady( isExportKitAllowed );
		}
	}, [ plugins ] );

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-export-plugins">
				<PageHeader
					heading={ __( 'Export your site as a Template Kit', 'elementor' ) }
					description={ __( 'Select which of these plugins are required for this kit work.', 'elementor' ) }
				/>

				<ExportPluginsSelection />
			</section>
		</Layout>
	);
}
