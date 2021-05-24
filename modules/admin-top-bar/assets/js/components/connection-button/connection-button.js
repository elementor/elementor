import BarButton from '../bar-button/bar-button';

export default function ConnectionButton( props ) {
	const isUserConnected = elementorCommonConfig.connect.is_user_connected;
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

	return (
		<BarButton icon="eicon-user-circle-o" onClick={connectAction} dataInfo={tooltipText}>{ buttonText }</BarButton>
	);
}

