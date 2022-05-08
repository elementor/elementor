import { Redirect } from '@reach/router';
import actionsMap from 'elementor-app/url-actions/actions-map';

export default function Index() {
	const urlSearchParams = new URLSearchParams( window.location.search ),
		queryParams = Object.fromEntries( urlSearchParams.entries() ),
		// The 'action' query param is translated into a route URL.
		url = actionsMap[ queryParams.action ] || elementorAppConfig.menu_url.split( '#' )?.[ 1 ];

	return (
		<Redirect to={ url || '/not-found' } noThrow={ true } />
	);
}
