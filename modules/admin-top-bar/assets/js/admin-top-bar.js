import BarButton from './components/bar-button/bar-button';
import BarHeading from './components/bar-heading/bar-heading';
import ConnectionButton from './components/connection-button/connection-button';
import { useEffect, useRef } from 'react';
import { usePageTitle } from './hooks/use-page-title/use-page-title';

export default function AdminTopBar() {
	const actionButtonsRef = useRef();

	// Indicate that the admin top bar is visible and the page content needs to push down below the admin top bar for visibility.
	useEffect( () => {
		const adminTopBarElement = document.querySelector( '#e-admin-top-bar' );
		adminTopBarElement.classList.add( 'top-bar-active' );
	}, [] );

	// Handle the page title visibility in admin top bar.
	const pageTitleText = usePageTitle();

	// Handle the action buttons visibility in admin top bar on initiation.
	useEffect( () => {
		const actionButtonElements = document.querySelectorAll( '.page-title-action' );
		actionButtonElements.forEach( ( actionButtonElement ) => {
			actionButtonsRef.current.appendChild( actionButtonElement );
		} );
	}, [] );

	const finderAction = () => {
		$e.route( 'finder' );
	};

	return (
		<div id="elementor-admin-top-bar">
			<div className="bar-main-area bar-flex">
				<BarHeading>{ pageTitleText }</BarHeading>
				<div className="top-bar-action-buttons-wrapper" ref={ actionButtonsRef } />
			</div>

			<div className="secondary-main-area bar-flex">
				<div className="bar-buttons-wrapper">
					{window.elementorAdminTopBarConfig.is_administrator ? <BarButton onClick={finderAction} icon="eicon-search-bold">{ __( 'Finder', 'elementor' ) }</BarButton> : ''}
					{window.elementorCloudAdmin ? window.elementorCloudAdmin() : ''}
				</div>

				<ConnectionButton />
			</div>
		</div>
	);
}
