import React from 'react';
import { useNavigate } from '@reach/router';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import PluginsSelection from '../../../shared/plugins-selection/plugins-selection';

import Button from 'elementor-app/ui/molecules/button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

import usePlugins from '../../../hooks/use-plugins';

export default function ExportPlugins() {
	const { pluginsState } = usePlugins(),
		navigate = useNavigate(),
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
			<section>
				<PageHeader
					heading={ __( 'Export a Template Kit', 'elementor' ) }
					description={ [
						__( 'Choose which Elementor components - templates, content and site settings - to include in your kit file.', 'elementor' ),
						<React.Fragment key="description-secondary-line">
							{ __( 'By default, all of your components will be exported.', 'elementor' ) }
						</React.Fragment>,
					] }
				/>

				<PluginsSelection plugins={ pluginsState.active } />
			</section>
		</Layout>
	);
}
