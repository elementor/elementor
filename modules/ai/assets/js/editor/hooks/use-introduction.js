import { useState } from 'react';

export default function useIntroduction( key ) {
	const [ isViewed, setIsViewed ] = useState( !! window.elementor?.config?.user?.introduction?.[ key ] );

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

					if ( window.elementor?.config?.user?.introduction ) {
						window.elementor.config.user.introduction[ key ] = true;
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
