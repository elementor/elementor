import BarButton from './components/bar-button/bar-button';
import BarHeading from './components/bar-heading/bar-heading';
import ConnectionButton from './components/connection-button/connection-button';
import { useEffect, useRef } from 'react';
import { usePageTitle } from './hooks/use-page-title/use-page-title';
import environment from 'elementor-common/utils/environment';

export default function AdminTopBar() {
	const actionButtonsRef = useRef(),
		promotion = window.elementorAdminTopBarConfig.promotion;

	// Handle Top Bar visibility on initiation: Indicate that the admin top bar is visible and the page content needs to push down below the admin top bar for visibility.
	useEffect( () => {
		const adminTopBarElement = document.querySelector( '#e-admin-top-bar-root' );
		adminTopBarElement.classList.add( 'e-admin-top-bar--active' );
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

	const controlSign = environment.mac ? '\u2318' : '^';
	const finderTooltipText = __( 'Search or do anything in Elementor', 'elementor' ) + ` ${ controlSign }+E`;

	const BarButtonNotification = window?.elementorNotificationCenter?.BarButtonNotification;

	return (
		<div className="e-admin-top-bar">
			<div className="e-admin-top-bar__main-area">
				<BarHeading>{ pageTitleText }</BarHeading>
				<div className="e-admin-top-bar__main-area-buttons" ref={ actionButtonsRef } />
			</div>

			<div className="e-admin-top-bar__secondary-area">
				<div className="e-admin-top-bar__secondary-area-buttons">
					{ ! elementorAppConfig.hasPro && <BarButton additionalClasses="accent" href={ promotion.url } target="__blank" icon="eicon-upgrade-crown" iconAdditionalClasses="crown-icon">{ promotion.text }</BarButton> }
					<BarButton href={ window.elementorAdminTopBarConfig.apps_url } icon="eicon-integration">{ __( 'Add-ons', 'elementor' ) }</BarButton>
					{ window.elementorAdminTopBarConfig.is_administrator ? <BarButton onClick={ finderAction } dataInfo={ finderTooltipText } icon="eicon-search-bold">{ __( 'Finder', 'elementor' ) }</BarButton> : '' }
					{ window.elementorCloudAdmin ? window.elementorCloudAdmin() : '' }
					{ BarButtonNotification
						? <BarButtonNotification defaultIsRead={ ! elementorNotifications?.is_unread }>{ __( 'What\'s New', 'elementor' ) }</BarButtonNotification>
						: ''
					}
				</div>
				<ConnectionButton />
			</div>
		</div>
	);
}
