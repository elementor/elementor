import React, { useEffect } from 'react';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import PluginsSelection from '../../../shared/plugins-selection/plugins-selection';

import Heading from 'elementor-app/ui/atoms/heading';
import Button from 'elementor-app/ui/molecules/button';
import WizardFooter from 'elementor-app/organisms/wizard-footer';

import usePlugins from '../../../hooks/use-plugins';

import './import-plugins.scss';

export default function ImportPlugins() {
	const { pluginsState, pluginsActions } = usePlugins(),
		pluginsToAdd = pluginsState.installed.filter( ( plugin ) => 'active' !== plugin.status ),
		activePluginsIndexes = pluginsState.active.map( ( plugin, index ) => index ),
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
					heading={ __( 'Select the plugins you want to import', 'elementor' ) }
					description={ __( 'These are the plugins that powers up your kit. You can deselect them, but it can impact the functionality of your site.', 'elementor' ) }
				/>

				<div className="e-app-import-plugins__selection-section">
					<Heading variant="h5" tag="h3" className="e-app-import-plugins__selection-section-heading">{ __( 'Plugins to add:', 'elementor' ) }</Heading>
					<PluginsSelection plugins={ pluginsToAdd } />
				</div>

				<div className="e-app-import-plugins__selection-section">
					<Heading variant="h5" tag="h3" className="e-app-import-plugins__selection-section-heading">{ __( 'Plugins you already have:', 'elementor' ) }</Heading>
					<PluginsSelection
						withHeader={ false }
						plugins={ pluginsState.active }
						initialSelections={ activePluginsIndexes }
						initialDisabled={ activePluginsIndexes }
					/>
				</div>
			</section>
		</Layout>
	);
}
