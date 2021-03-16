export default function useAction() {
	return {
		backToDashboard: () => {
			if ( window.top === window ) {
				// Directly.
				window.top.location = elementorAppConfig.return_url;
			} else {
				// Iframe.
				window.top.$e.run( 'app/close' );
			}
		},
	};
}
