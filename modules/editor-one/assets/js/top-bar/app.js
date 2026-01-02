import ReactUtils from 'elementor-utils/react';
import { ElementorOneHeader, ElementorOneAssetsProvider } from '@elementor/elementor-one-assets';

const App = () => {
	const { elementorOneTopBarConfig: { version, title, environment } } = window;

	return (
		<ElementorOneAssetsProvider env={ environment }>
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
