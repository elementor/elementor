import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';

import ExportPluginsSelection from './components/export-plugins-selection/export-plugins-selection';

import Button from 'elementor-app/ui/molecules/button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

import './export-plugins.scss';

const ELEMENTOR_PLUGIN_KEY = 'Elementor';

export default function ExportPlugins() {
	const [ isKitReady, setIsKitReady ] = useState( false ),
		context = useContext( Context ),
		navigate = useNavigate(),
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
		hasPluginsToExport = ( plugins ) => {
			// In case that there are at least two plugins it means that Elementor is not the only plugin to export.
			if ( plugins.length > 1 ) {
				return true;
			}

			// Making sure that Elementor is not the only plugin to export.
			return 1 === plugins.length && ELEMENTOR_PLUGIN_KEY !== plugins[ 0 ].name;
		},
		onPluginsReady = ( plugins ) => {
			// In case there are no kit-content items or plugins to export, going back to the main screen.
			if ( ! context.data.includes.length && ! hasPluginsToExport( plugins ) ) {
				navigate( '/export' );
			} else if ( ! hasPluginsToExport( plugins ) ) {
				navigate( '/export/process' );
			} else {
				setIsKitReady( true );
			}
		};

	useEffect( () => {
		// When not starting from the main screen.
		if ( ! context.data.isExportProcessStarted ) {
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

				<ExportPluginsSelection onPluginsReady={ onPluginsReady } />
			</section>
		</Layout>
	);
}
