import BarButton from './components/bar-button/bar-button';
import BarHeading from './components/bar-heading/bar-heading';
import { useEffect, useState, useRef } from 'react';

export default function AdminTopBar() {
	let actionButtonElements;
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
		} else {
			setPageTitle( 'Elementor' );
		}
	}, [] );

	// Handle the action buttons visibility in admin top bar on initiation.
	useEffect( () => {
		actionButtonElements = document.querySelectorAll( '.page-title-action' );
		if ( actionButtonElements ) {
			actionButtonElements.forEach( ( actionButtonElement ) => {
				actionButtonsRef.current.appendChild( actionButtonElement );
			} );
		}
	}, [] );

	const isUserConnected = elementorCommonConfig.connect.is_user_connected;
	const finderAction = () => {
		$e.route( 'finder' );
	};

	const connectButton = () => {
		const connectAction = () => {
			window.open( connectUrl );
		};

		let tooltipText = __( 'Connect your account to get access to Elementor\'s Template Library & more.', 'elementor' ),
			connectUrl = elementorCommonConfig.connect.connect_url,
			buttonText = __( 'Connect Account', 'elementor' );

		if ( isUserConnected ) {
			tooltipText = '',
				connectUrl = 'https://go.elementor.com/wp-dash-admin-bar-account/',
				buttonText = __( 'My Elementor', 'elementor' );
		}

		return <BarButton icon="eicon-user-circle-o" onClick={connectAction} dataInfo={tooltipText}>{ buttonText }</BarButton>;
	};

	return (
		<div id="elementor-admin-top-bar">
			<div className="bar-main-area bar-flex">
				<BarHeading>{ pageTitle }</BarHeading>
				<div className="top-bar-action-buttons-wrapper" ref={ actionButtonsRef } />
			</div>

			<div className="secondary-main-area bar-flex">
				<div className="bar-buttons-wrapper">
					<BarButton onClick={finderAction} icon="eicon-search-bold">{ __( 'Finder', 'elementor' ) }</BarButton>
					{window.elementorCloudAdmin ? window.elementorCloudAdmin() : ''}
				</div>
				{ connectButton() }
			</div>
		</div>
	);
}
