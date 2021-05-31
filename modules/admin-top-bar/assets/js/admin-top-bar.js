import BarButton from './components/bar-button/bar-button';
import BarHeading from './components/bar-heading/bar-heading';
import ConnectionButton from './components/connection-button/connection-button';
import { useEffect, useRef } from 'react';
import { usePageTitle } from './hooks/use-page-title/use-page-title';

export default function AdminTopBar( props ) {
	const actionButtonsRef = useRef();

	// Handle Top Bar visibility on initiation and when toggle the admin top bar checkbox in screen options
	useEffect( () => {
		const adminTopBarCheckboxElement = document.querySelector( '#e-dashboard-widget-admin-top-bar-hide' );
		const adminTopBarElement = document.querySelector( '#e-admin-top-bar' );

		if ( ! adminTopBarCheckboxElement || adminTopBarCheckboxElement.checked ) {
			adminTopBarElement.classList.add( 'top-bar-active' );
		}

		if ( adminTopBarCheckboxElement ) {
			adminTopBarCheckboxElement.addEventListener( 'change', function() {
				if ( this.checked ) {
					adminTopBarElement.classList.add( 'top-bar-active' );
				} else {
					adminTopBarElement.classList.remove( 'top-bar-active' );
				}
			} );
		}
	}, [] );

	// Handle the page title visibility in admin top bar.
	const pageTitleText = usePageTitle( props.isDashboard );

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

AdminTopBar.propTypes = {
	isDashboard: PropTypes.boolean,
};
