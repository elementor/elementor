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
		handlePluginsSelection = () => setIsKitReady( true ),
		handleNoSelection = () => {
			if ( ! sharedContext.data.includes.length ) {
				// In case there are no kit-content items or plugins to export, going back to the main screen.
				navigate( '/export' );
			} else {
				// In case there are no plugins to export, moving on to the next screen.
				navigate( '/export/process' );
			}
		};

	useEffect( () => {
		// When not starting from the main screen.
		if ( ! exportContext.data.isExportProcessStarted ) {
			navigate( '/export' );
		}
	}, [] );

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-export-plugins">
				<PageHeader
					heading={ __( 'Export your site as a Template Kit', 'elementor' ) }
					description={ __( 'Select which of these plugins are required for this kit work.', 'elementor' ) }
				/>

				<ExportPluginsSelection
					onPluginsSelection={ handlePluginsSelection }
					onNoSelection={ handleNoSelection }
				/>
			</section>
		</Layout>
	);
}
