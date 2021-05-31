import { useState, useEffect } from 'react';

export const usePageTitle = ( isDashboard ) => {
	const [ pageTitle, setPageTitle ] = useState( 'Elementor' );

	useEffect( () => {
		const pageTitleElement = document.querySelector( '.wp-heading-inline' );
		if ( ! pageTitleElement && ! isDashboard ) {
			return;
		}

		if ( isDashboard ) {
			setPageTitle( 'Dashboard' );
		} else {
			setPageTitle( pageTitleElement.innerText );
			pageTitleElement.remove();
		}
	}, [ ] );

	return pageTitle;
};
