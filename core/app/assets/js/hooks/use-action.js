export default function useAction() {
	return {
		backToDashboard: () => {
			// The split is necessary because `elementorAppConfig.return_url` comes from WP with no parameters.
			const istargetIdenticalToCurrent = location.href.split( /[&#]/ )[ 0 ] === elementorAppConfig.return_url,
				isReturnUrlLogin = elementorAppConfig.return_url.includes( elementorAppConfig.login_url );

			if ( window.top === window ) {
				// Directly - in case that the return_url is the login-page, the target should be the admin-page and not the login-page again.
				window.top.location = istargetIdenticalToCurrent || isReturnUrlLogin ? elementorAppConfig.admin_url : elementorAppConfig.return_url;
			} else {
				// Iframe.
				window.top.$e.run( 'app/close' );
			}
		},
	};
}
