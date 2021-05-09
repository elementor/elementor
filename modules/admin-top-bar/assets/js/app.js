import BarHeading from 'elementor/modules/admin-top-bar/assets/js/components/bar-heading/bar-heading';
import BarButton from 'elementor/modules/admin-top-bar/assets/js/components/bar-button/bar-button';
import PageButton from 'elementor/modules/admin-top-bar/assets/js/components/page-button/page-button';

export default function AdminTopBar( props ) {
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
			<div className="bar-main-area">
				<BarHeading>{props.title}</BarHeading>
				{props.buttons.map( ( button, index ) => {
					return <PageButton key={ index } { ...button }></PageButton>;
				} )}
			</div>

			<div className="bar-action-area">
				<BarButton onClick={finderAction} icon="eicon-search-bold">Finder</BarButton>
				{renderConnectButton()}
			</div>
		</div>
	);
}

AdminTopBar.propTypes = {
	title: PropTypes.any,
	buttons: PropTypes.array,
};
