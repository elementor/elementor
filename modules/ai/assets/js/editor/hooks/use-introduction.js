import { useState } from 'react';

export default function useIntroduction( key ) {
	const [ isViewed, setIsViewed ] = useState( !! window.ElementorConfig?.user?.introduction?.[ key ] );

	function markAsViewed() {
		if ( ! key ) {
			return Promise.reject();
		}

		return new Promise( ( resolve, reject ) => {
			if ( isViewed ) {
				reject();
			}

			elementorCommon.ajax.addRequest( 'introduction_viewed', {
				data: { introductionKey: key },
				error: () => reject(),
				success: () => {
					setIsViewed( true );

					if ( window.ElementorConfig?.user?.introduction ) {
						window.ElementorConfig.user.introduction[ key ] = true;
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
