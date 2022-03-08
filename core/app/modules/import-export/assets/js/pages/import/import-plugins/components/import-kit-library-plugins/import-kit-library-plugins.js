import React, { useContext, useEffect } from 'react';

import Layout from '../../../../../templates/layout';

import ImportContextProvider, { ImportContext } from '../../../../../context/import-context/import-context-provider';
import usePlugins from '../../../../../hooks/use-plugins';
import usePluginsData from '../../../../../hooks/use-plugins-data';
import useImportPluginsData from '../../hooks/use-import-plugins-data';
import PluginsToImport from '../plugins-to-import/plugins-to-import';
import ImportPluginsActivation from '../../../import-plugins-activation/import-plugins-activation';
import { useNavigate } from '@reach/router';

export default function ImportKitLibraryPlugins() {
	const importContext = useContext( ImportContext ),
		plugins = importContext.data.plugins || importContext.data.uploadedData.manifest.plugins || {},
		navigate = useNavigate(),
		{ response, pluginsActions } = usePlugins(),
		//all installed plugins
		{ pluginsData } = usePluginsData( response.data ),
		{ importPluginsData } = useImportPluginsData( plugins, pluginsData ),
		{ missing, existing, minVersionMissing, proData } = importPluginsData || {},
		handleRequiredPlugins = () => {
			if ( missing && missing.length ) {
				// Saving globally the plugins data that the kit requires in order to work properly.
				importContext.dispatch( { type: 'SET_PLUGINS', payload: missing } );
				navigate( '/import/plugins-activation' );
			}
		},
		handleProInstallationStatus = () => {
			// In case that the Pro data is now exist but initially in the elementorAppConfig the value was false, it means that the pro was added during the process.
			if ( proData && ! elementorAppConfig.hasPro ) {
				importContext.dispatch( { type: 'SET_IS_PRO_INSTALLED_DURING_PROCESS', payload: true } );
			}
		};

		useEffect( () => {
			handleRequiredPlugins();
			handleProInstallationStatus();
		}, [ plugins ] );

	return (
		<p>Plugins are coming...</p>
	);
}

ImportKitLibraryPlugins.propTypes = {
	plugins: PropTypes.array,
};

