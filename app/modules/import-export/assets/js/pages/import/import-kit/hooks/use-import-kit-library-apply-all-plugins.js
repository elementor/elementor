import { useEffect, useState } from 'react';
import usePlugins from '../../../../hooks/use-plugins';
import usePluginsData from '../../../../hooks/use-plugins-data';
import useImportPluginsData from '../../import-plugins/hooks/use-import-plugins-data';

export function useImportKitLibraryApplyAllPlugins( plugins ) {
	const [ missingPlugins, setMissingPlugins ] = useState(),
		{ response } = usePlugins(),
		{ pluginsData } = usePluginsData( response.data ),
		{ importPluginsData } = useImportPluginsData( plugins, pluginsData ),
		{ missing } = importPluginsData || {};

	useEffect( () => {
		if ( plugins && ! plugins.length ) {
			return;
		}
		setMissingPlugins( missing );
	}, [ plugins, missing ] );

	return missingPlugins;
}
