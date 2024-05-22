import { useState } from 'react';

export default function useIntroduction( key ) {
	const globalConfig = window.elementor ? window.elementor.config?.user : window.elementorAdmin?.config?.user;
	const [ isViewed, setIsViewed ] = useState( !! globalConfig?.introduction?.[ key ] );

	function markAsViewed() {
		if ( ! key ) {
			return Promise.reject();
		}

		return new Promise( ( resolve, reject ) => {
			if ( isViewed ) {
				reject();
			}

			setIsViewed( true );

			elementorCommon.ajax.addRequest( 'introduction_viewed', {
				data: { introductionKey: key },
				error: () => {
					setIsViewed( false );

					reject();
				},
				success: () => {
					setIsViewed( true );

					if ( globalConfig?.introduction ) {
						globalConfig.introduction[ key ] = true;
					}

					resolve();
				},
			} );
		} );
	}

	return {
		isViewed,
		markAsViewed,
	};
}
