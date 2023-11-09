import { useTheme } from '@elementor/ui';
import { useState } from 'react';

export const useAttachUrlService = ( ) => {
	const [ currentUrl, setCurrentUrl ] = useState( '' );
	const theme = useTheme();
	const APP_BASE_URL = ElementorAiConfig.builder_url;

	const urlObject = new URL( APP_BASE_URL );
	urlObject.searchParams.append( 'colorScheme', theme.palette.mode );
	urlObject.searchParams.append( 'isRTL', 'rtl' === theme.direction ? 'true' : 'false' );

	if ( currentUrl ) {
		urlObject.searchParams.append( 'url', currentUrl );
	}

	return {
		iframeSource: urlObject.toString(),
		currentUrl,
		setCurrentUrl,
	};
};
