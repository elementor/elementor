import React, { useEffect } from 'react';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import PluginsSelection from '../../../shared/plugins-selection/plugins-selection';

import Button from 'elementor-app/ui/molecules/button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

import usePlugins from '../../../hooks/use-plugins';

export default function ExportPlugins() {
	const { pluginsState, pluginsActions } = usePlugins(),
		getFooter = () => (
			<WizardFooter separator justify="end">
				<Button text="Action" />
			</WizardFooter>
		);

	useEffect( () => {
		console.log( 'plugins: ', pluginsState );
	}, [ pluginsState ] );

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
