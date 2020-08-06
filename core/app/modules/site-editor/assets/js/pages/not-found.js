import router from 'elementor-app/router';
import ErrorDialog from '../organisms/error-dialog';

export default function NotFound() {
	const url = elementorAppConfig.menu_url.split( '#' )?.[ 1 ] || '/site-editor';

	return (
		<ErrorDialog goBackHandler={ () => router.appHistory.navigate( url ) }/>
	);
}
