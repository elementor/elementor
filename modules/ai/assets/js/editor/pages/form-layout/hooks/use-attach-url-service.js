import { useTheme } from '@elementor/ui';
import { useState } from 'react';
import useUserInfo from '../../../hooks/use-user-info';

export const useAttachUrlService = ( ) => {
	const [ currentUrl, setCurrentUrl ] = useState( '' );
	const theme = useTheme();
	const { isLoaded, builderUrl } = useUserInfo();

	if ( ! isLoaded ) {
		return {
			iframeSource: '',
			currentUrl,
			setCurrentUrl,
		};
	}

	const urlObject = new URL( builderUrl );
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
