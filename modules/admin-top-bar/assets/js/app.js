import BarHeading from 'elementor/modules/admin-top-bar/assets/js/components/bar-heading/bar-heading';
import BarButton from 'elementor/modules/admin-top-bar/assets/js/components/bar-button/bar-button';
import { useEffect, useState, useRef } from 'react';

export default function AdminTopBar() {
	const actionButtonsRef = useRef();
	const [ pageTitle, setPageTitle ] = useState( null );
	// const [ actionButtons, setActionButtons ] = useState( null );

	useEffect( () => {
		const pageTitleElement = document.querySelector( '.wp-heading-inline' );
		if ( pageTitleElement ) {
			const pageTitleText = pageTitleElement.innerText;
			pageTitleElement.remove();
			setPageTitle( pageTitleText );
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

	const renderConnectButton = () => {
		const connectAction = () => {
			window.open( connectUrl );
		};

		if ( isUserConnected ) {
			connectUrl = 'https://go.elementor.com/wp-dash-admin-bar-account/';
			return <BarButton icon="eicon-user-circle-o" onClick={connectAction}>My Elementor</BarButton>;
		}
		connectUrl = elementorCommonConfig.connect.connect_url;
		return <BarButton icon="eicon-user-circle-o" onClick={connectAction}>Connect Account</BarButton>;
	};

	return (
		<div id="elementor-admin-top-bar">
			<div className="bar-main-area bar-flex">
				<BarHeading>{ pageTitle }</BarHeading>
				<div className="top-bar-action-buttons-wrapper" ref={ actionButtonsRef } ></div>
			</div>

			<div className="bar-action-area bar-flex">
				<BarButton onClick={finderAction} icon="eicon-search-bold">Finder</BarButton>
				{renderConnectButton()}
			</div>
		</div>
	);
}
