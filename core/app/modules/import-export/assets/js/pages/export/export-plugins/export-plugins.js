import React from 'react';
import { useNavigate } from '@reach/router';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';

import ExportPluginsSelection from './components/export-plugins-selection/export-plugins-selection';

import Button from 'elementor-app/ui/molecules/button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

import './export-plugins.scss';

export default function ExportPlugins() {
	const navigate = useNavigate(),
		getFooter = () => (
			<WizardFooter separator justify="end">
				<Button
					text={ __( 'Back', 'elementor' ) }
					variant="contained"
					onClick={ () => navigate( '/export' ) }
				/>

				<Button
					text={ __( 'Create Kit', 'elementor' ) }
					variant="contained"
					color="primary"
					onClick={ () => navigate( '/export/process' ) }
				/>
			</WizardFooter>
		);

	return (
		<Layout type="export" footer={ getFooter() }>
			<section className="e-app-export-plugins">
				<PageHeader
					heading={ __( 'Export a Template Kit', 'elementor' ) }
					description={ [
						__( 'Choose which Elementor components - templates, content and site settings - to include in your kit file.', 'elementor' ),
						<React.Fragment key="description-secondary-line">
							{ __( 'By default, all of your components will be exported.', 'elementor' ) }
						</React.Fragment>,
					] }
				/>

				<ExportPluginsSelection />
			</section>
		</Layout>
	);
}
