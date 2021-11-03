import React from 'react';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import PluginsSelection from '../../../shared/plugins-selection/plugins-selection';

import Button from 'elementor-app/ui/molecules/button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

export default function ExportPlugins() {
	const getFooter = () => (
			<WizardFooter separator justify="end">
				<Button text="Action" />
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

				<PluginsSelection />
			</section>
		</Layout>
	);
}
