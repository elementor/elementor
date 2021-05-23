import BarHeading from './components/bar-heading/bar-heading';
import BarButton from './components/bar-button/bar-button';
import { useEffect, useState, useRef } from 'react';

export default function AdminTopBar() {
	let actionButtonElements;
	let clonedActionButtonElements;
	const actionButtonsRef = useRef();
	const [ pageTitle, setPageTitle ] = useState( null );

	// Indicate that the admin top bar is visible and the page content needs to push down below the admin top bar for visibility.
	useEffect( () => {
		const adminTopBarElement = document.querySelector( '#e-admin-top-bar' );
		adminTopBarElement.classList.add( 'top-bar-active' );
	}, [] );

	// Handle the page title visibility in admin top bar.
	useEffect( () => {
		const pageTitleElement = document.querySelector( '.wp-heading-inline' );
		if ( pageTitleElement ) {
			const pageTitleText = pageTitleElement;
			pageTitleElement.remove();
			setPageTitle( pageTitleText.innerText );
		}
	}, [] );

	// Handle the action buttons visibility in admin top bar on initiation.
	useEffect( () => {
		actionButtonElements = document.querySelectorAll( '.page-title-action' );
		if ( actionButtonElements ) {
			actionButtonElements.forEach( ( actionButtonElement ) => {
				actionButtonsRef.current.appendChild( actionButtonElement.cloneNode( true ) );
			} );

			clonedActionButtonElements = document.querySelectorAll( '.top-bar-action-buttons-wrapper' );
		}
	}, [] );

	const isUserConnected = elementorCommonConfig.connect.is_user_connected;
	let connectUrl = '';
	const finderAction = () => {
		$e.route( 'finder' );
	};

	const connectButton = () => {
		const connectAction = () => {
			window.open( connectUrl );
		};

		connectUrl = isUserConnected ? 'https://go.elementor.com/wp-dash-admin-bar-account/' : elementorCommonConfig.connect.connect_url;
		const buttonText = isUserConnected ? __( 'My Elementor', 'elementor' ) : __( 'Connect Account', 'elementor' );
		// const connectButtonText = ! isMobile ? buttonText : '';
		return <BarButton icon="eicon-user-circle-o" onClick={connectAction}>{ buttonText }</BarButton>;
	};

	return (
		<div id="elementor-admin-top-bar">
			<div className="bar-main-area bar-flex">
				<BarHeading>{ pageTitle }</BarHeading>
				<div className="top-bar-action-buttons-wrapper" ref={ actionButtonsRef } ></div>
			</div>

			<div className="secondary-main-area bar-flex">
				<div className="bar-buttons-wrapper">
					<BarButton onClick={finderAction} icon="eicon-search-bold">{ __( 'Finder', 'elementor' ) }</BarButton>
				</div>
				{ connectButton() }
			</div>
		</div>
	);
}
