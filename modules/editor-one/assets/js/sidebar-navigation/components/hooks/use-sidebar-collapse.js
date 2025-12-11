import { useEffect, useState, useCallback } from '@wordpress/element';

const STORAGE_KEY = 'elementor_sidebar_collapsed';

export const useSidebarCollapse = () => {
	const [ isCollapsed, setIsCollapsed ] = useState( () => {
		return 'true' === localStorage.getItem( STORAGE_KEY );
	} );

	const toggleCollapse = useCallback( () => {
		const newState = ! isCollapsed;
		setIsCollapsed( newState );
		localStorage.setItem( STORAGE_KEY, String( newState ) );
	}, [ isCollapsed ] );

	useEffect( () => {
		const container = document.getElementById( 'editor-one-sidebar-navigation' );
		const body = document.body;

		if ( isCollapsed ) {
			container?.classList.add( 'e-sidebar-collapsed' );
			body.classList.add( 'e-sidebar-is-collapsed' );
		} else {
			container?.classList.remove( 'e-sidebar-collapsed' );
			body.classList.remove( 'e-sidebar-is-collapsed' );
		}
	}, [ isCollapsed ] );

	return { isCollapsed, toggleCollapse };
};

