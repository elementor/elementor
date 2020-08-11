import { Redirect } from '@reach/router';

export default function Index() {
	const url = elementorAppConfig.menu_url.split( '#' )?.[1] || '/not-found';

	return (
		<Redirect to={url} noThrow={ true } />
	);
}
