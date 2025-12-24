import ReactUtils from 'elementor-utils/react';
import { ElementorOneHeader, ElementorOneAssetsProvider } from '@elementor/elementor-one-assets';

const App = () => {
	return (
		<ElementorOneAssetsProvider env="production" language="en">
			<ElementorOneHeader appType="PLUGIN" />
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
