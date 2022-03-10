import React, { useContext, useEffect } from 'react';

import { ImportContext } from '../../../../../context/import-context/import-context-provider';
import usePlugins from '../../../../../hooks/use-plugins';
import usePluginsData from '../../../../../hooks/use-plugins-data';
import useImportPluginsData from '../../hooks/use-import-plugins-data';
import { useNavigate } from '@reach/router';

export default function ImportKitLibraryPlugins() {
	const importContext = useContext( ImportContext ),
		plugins = importContext.data.plugins || {},
		navigate = useNavigate(),
		{ response } = usePlugins(),
		//all installed plugins
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

		useEffect( () => {
			handleRequiredPlugins();
		}, [ plugins, missing ] );

	return (
		<span>.</span>
	);
}

ImportKitLibraryPlugins.propTypes = {
	plugins: PropTypes.array,
};

