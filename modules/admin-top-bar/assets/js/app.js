import BarHeading from 'elementor/modules/admin-top-bar/assets/js/components/bar-heading/bar-heading';
import BarButton from 'elementor/modules/admin-top-bar/assets/js/components/bar-button/bar-button';

export default function App() {
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
			<BarHeading>Elementor</BarHeading>
			<div className="bar-action-area">
				<BarButton onClick={finderAction} icon="eicon-search-bold">Finder</BarButton>
				{renderConnectButton()}
			</div>
		</div>
	);
}
