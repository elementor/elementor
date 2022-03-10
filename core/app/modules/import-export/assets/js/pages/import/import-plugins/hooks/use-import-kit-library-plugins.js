import { useContext, useEffect } from 'react';
import usePlugins from '../../../../hooks/use-plugins';
import usePluginsData from '../../../../hooks/use-plugins-data';
import useImportPluginsData from './use-import-plugins-data';
import { useNavigate } from '@reach/router';
import { ImportContext } from '../../../../context/import-context/import-context-provider';

export default function UseImportKitLibraryPlugins() {
	const navigate = useNavigate(),
		importContext = useContext( ImportContext ),
		plugins = importContext.data.plugins || {},
		{ response } = usePlugins(),
		{ pluginsData } = usePluginsData( response.data ),
		{ importPluginsData } = useImportPluginsData( plugins, pluginsData ),
		{ missing } = importPluginsData || {},
		handleRequiredPlugins = () => {
			if ( missing?.length ) {
				// Saving globally the plugins data that the kit requires in order to work properly.
				importContext.dispatch( { type: 'SET_PLUGINS', payload: missing } );
				navigate( '/import/plugins-activation' );
			}
		};

		return (
			handleRequiredPlugins
		);
}
