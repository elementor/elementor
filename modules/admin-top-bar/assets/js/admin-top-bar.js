import BarButton from './components/bar-button/bar-button';
import BarHeading from './components/bar-heading/bar-heading';
import ConnectionButton from './components/connection-button/connection-button';
import { useEffect, useRef } from 'react';
import { usePageTitle } from './hooks/use-page-title/use-page-title';
import environment from 'elementor-common/utils/environment';

export default function AdminTopBar( props ) {
	const actionButtonsRef = useRef();

	// Handle Top Bar visibility on initiation and when toggle the admin top bar checkbox in screen options
	useEffect( () => {
		const adminTopBarCheckboxElement = document.querySelector( '#e-dashboard-widget-admin-top-bar-hide' );
		const adminTopBarElement = document.querySelector( '#e-admin-top-bar-root' );

		if ( ! adminTopBarCheckboxElement || adminTopBarCheckboxElement.checked ) {
			adminTopBarElement.classList.add( 'e-admin-top-bar--active' );
		} else {
			adminTopBarElement.classList.add( 'e-admin-top-bar--inactive' );
		}

		if ( adminTopBarCheckboxElement ) {
			adminTopBarCheckboxElement.addEventListener( 'change', function() {
				adminTopBarElement.classList.toggle( 'e-admin-top-bar--active' );
				adminTopBarElement.classList.toggle( 'e-admin-top-bar--inactive' );
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

	const controlSign = environment.mac ? '⌘' : '^';
	const finderTooltipText = __( 'Search anything in Elementor', 'elementor' ) + ` ${ controlSign }+E`;

	return (
		<div className="e-admin-top-bar">
			<div className="e-admin-top-bar__main-area">
				<BarHeading>{ pageTitleText }</BarHeading>
				<div className="e-admin-top-bar__main-area-buttons" ref={ actionButtonsRef } />
			</div>

			<div className="e-admin-top-bar__secondary-area">
				<div className="e-admin-top-bar__secondary-area-buttons">
					{window.elementorAdminTopBarConfig.is_administrator ? <BarButton onClick={finderAction} dataInfo={finderTooltipText} icon="eicon-search-bold">{ __( 'Finder', 'elementor' ) }</BarButton> : ''}
					{window.elementorCloudAdmin ? window.elementorCloudAdmin() : ''}
				</div>

				<ConnectionButton />
			</div>
		</div>
	);
}

AdminTopBar.propTypes = {
	isDashboard: PropTypes.bool,
};
