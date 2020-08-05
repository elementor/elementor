import { Redirect } from '@reach/router';
import ErrorDialog from '../organisms/error-dialog';

export default function NotFound() {
	const [ redirect, setRedirect ] = React.useState( false );

	if ( redirect ) {
		const url = elementorAppConfig.menu_url.split( '#' )?.[ 1 ] || '/site-editor';

		// TODO: Check what happen to the redirect.
		return <Redirect from={'/'} to={ url } noThrow={ true }/>;
	}

	return (
		<ErrorDialog goBackHandler={ () => setRedirect( true ) }/>
	);
}
