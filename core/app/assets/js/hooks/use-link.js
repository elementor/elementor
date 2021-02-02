export default function useLink() {
	return {
		url: {
			goPro: 'https://elementor.com/pro/',
		},
		action: {
			backToDashboard: () => {
				if ( window.top === window ) {
					// Directly.
					window.top.location = elementorAppConfig.return_url;
				} else {
					// Iframe.
					window.top.$e.run( 'app/close' );
				}
			},
		},
	};
}
