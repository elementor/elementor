import { useTheme } from '@elementor/ui';
import { useState } from 'react';
import { CONFIG_KEYS, useRemoteConfig } from '../context/remote-config';

export const useAttachUrlService = ( args ) => {
	const [ currentUrl, setCurrentUrl ] = useState( args.targetUrl );
	const theme = useTheme();
	const { isLoaded, isError, remoteConfig } = useRemoteConfig();

	if ( ! isLoaded || isError || ! remoteConfig[ CONFIG_KEYS.WEB_BASED_BUILDER_URL ] ) {
		return {
			iframeSource: '',
			currentUrl,
			setCurrentUrl,
		};
	}

	const urlObject = new URL( remoteConfig[ CONFIG_KEYS.WEB_BASED_BUILDER_URL ] );
	urlObject.searchParams.append( 'colorScheme', theme.palette.mode );
	urlObject.searchParams.append( 'isRTL', 'rtl' === theme.direction ? 'true' : 'false' );
	urlObject.searchParams.append( 'version', window.elementorCommon?.config?.version );

	if ( currentUrl ) {
		urlObject.searchParams.append( 'url', currentUrl );
	}

	return {
		iframeSource: urlObject.toString(),
		currentUrl,
		setCurrentUrl,
	};
};
