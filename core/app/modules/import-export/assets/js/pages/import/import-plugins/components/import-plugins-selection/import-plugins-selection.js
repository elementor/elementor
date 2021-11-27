import { useContext, useEffect } from 'react';
import { Context } from '../../../../../context/context-provider';

import PluginsSelection from '../../../../../shared/plugins-selection/plugins-selection';

import Heading from 'elementor-app/ui/atoms/heading';
import ProBanner from '../pro-banner/pro-banner';

import usePlugins from '../../../../../hooks/use-plugins';

export default function ImportPluginsSelection() {
	let isProPluginExist = false;

	const context = useContext( Context ),
		pluginsToImport = content.data.uploadedData.manifest.plugins,
		{ pluginsState } = usePlugins(),
		plugins = pluginsToImport.filter( ( plugin ) => {
			// In case that Pro is installed but not activated it should be displayed separately from the plugins list.
			if ( 'Elementor Pro' === plugin.name ) {
				isProPluginExist = true;

				return false;
			}

			return 'active' !== plugin.status;
		} ),
		initialSelected = plugins.map( ( plugin, index ) => index ),
		handleOnSelect = ( selectedPlugins ) => context.dispatch( { type: 'SET_PLUGINS', payload: selectedPlugins } );

	useEffect( () => {
		console.log( 'uploaded', context.data );
		console.log( 'plugins', context.data.plugins );
	}, [ context.data.plugins ] );

	useEffect( () => {
		console.log( 'pluginsState', pluginsState );
	}, [ pluginsState ] );

	if ( ! plugins.length ) {
		return null;
	}

	return (
		<div className="e-app-import-plugins__section">
			{
				isProPluginExist &&
				<ProBanner />
			}

			<Heading variant="h5" tag="h3" className="e-app-import-plugins__section-heading">{ __( 'Plugins to add:', 'elementor' ) }</Heading>

			<PluginsSelection
				plugins={ plugins }
				initialSelected={ initialSelected }
				onSelect={ handleOnSelect }
				layout={ [ 3, 1, 1 ] }
			/>
		</div>
	);
}
