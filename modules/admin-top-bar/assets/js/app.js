import BarHeading from './components/bar-heading/bar-heading';
import BarButton from './components/bar-button/bar-button';
import { useEffect, useState, useRef } from 'react';

function getIsMobile() {
	const isMobile = window.innerWidth < 768;

	return isMobile;
}

export default function AdminTopBar() {
	const actionButtonsRef = useRef();
	const [ pageTitle, setPageTitle ] = useState( null );
	const [ isMobile, setIsMobile ] = useState( getIsMobile() );

	useEffect( () => {
		function handleResize() {
			setIsMobile( getIsMobile() );
		}

		window.addEventListener( 'resize', handleResize );
		return () => window.removeEventListener( 'resize', handleResize );
	}, [] );

	useEffect( () => {
		const pageTitleElement = document.querySelector( '.wp-heading-inline' );
		if ( pageTitleElement ) {
			const pageTitleText = pageTitleElement;
			pageTitleElement.remove();
			setPageTitle( pageTitleText.innerText );
		}
	}, [] );

	useEffect( () => {
		const actionButtonElements = document.querySelectorAll( '.page-title-action' );
		if ( actionButtonElements ) {
			actionButtonElements.forEach( ( actionButtonElement ) => {
				actionButtonsRef.current.appendChild( actionButtonElement );
			} );
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
		const connectButtonText = ! isMobile ? buttonText : '';
		return <BarButton icon="eicon-user-circle-o" onClick={connectAction}>{ connectButtonText }</BarButton>;
	};

	return (
		<div id="elementor-admin-top-bar">
			<div className="bar-main-area bar-flex">
				<BarHeading>{ pageTitle }</BarHeading>
				{ ! isMobile ? <div className="top-bar-action-buttons-wrapper" ref={ actionButtonsRef } ></div> : '' }
			</div>

			<div className="bar-action-area bar-flex">
				{ ! isMobile ? ( <BarButton onClick={finderAction} icon="eicon-search-bold">{ __( 'Finder', 'elementor' ) }</BarButton> ) : '' }
				{ connectButton() }
			</div>
		</div>
	);
}
