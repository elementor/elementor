import ReactUtils from 'elementor-utils/react';
import { ElementorOneHeader, ElementorOneAssetsProvider } from '@elementor/elementor-one-assets';
import { useAdminMenuOffset } from '../sidebar-navigation/components/hooks/use-admin-menu-offset';
import isRTL from '../shared/is-rtl';

const App = () => {
	const { elementorOneTopBarConfig: { version, title, environment } } = window;

	const isRtlLanguage = isRTL();

	useAdminMenuOffset();

	return (
		<ElementorOneAssetsProvider env={ environment } isRTL={ isRtlLanguage }>
			<ElementorOneHeader
				appSettings={ { slug: 'elementor', version } }
				isWithinWpAdmin
				title={ title }
			/>
		</ElementorOneAssetsProvider>
	);
};

const rootElement = document.getElementById( 'editor-one-top-bar' );

if ( rootElement ) {
	ReactUtils.render(
		<App />,
		rootElement,
	);
}
