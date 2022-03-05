import { useContext, useEffect } from 'react';
import usePlugins from '../../../../hooks/use-plugins';
import usePluginsData from '../../../../hooks/use-plugins-data';
import useImportPluginsData from './use-import-plugins-data';
import { useNavigate } from '@reach/router';
import { importContext } from '../../../../context/import-context/import-context-provider';

export default function UseImportKitLibraryPlugins() {
	const navigate = useNavigate(),
		{ response, pluginsActions } = usePlugins(),
		{ pluginsData } = usePluginsData( response.data ),
		{ importPluginsData } = useImportPluginsData( plugins, pluginsData ),
		{ missing, existing, minVersionMissing, proData } = importPluginsData || {},
		handleRequiredPlugins = () => {
			if ( missing && missing.length ) {
				console.log( 'missing: ', missing );
				// Saving globally the plugins data that the kit requires in order to work properly.
				importContext.dispatch( { type: 'SET_REQUIRED_PLUGINS', payload: missing } );
				navigate( '/import/plugins-activation' );
			}
		};
		// handleProInstallationStatus = () => {
		// 	// In case that the Pro data is now exist but initially in the elementorAppConfig the value was false, it means that the pro was added during the process.
		// 	if ( proData && ! elementorAppConfig.hasPro ) {
		// 		importContext.dispatch( { type: 'SET_IS_PRO_INSTALLED_DURING_PROCESS', payload: true } );
		// 	}
		// };

		return (
			handleRequiredPlugins
		);
}
