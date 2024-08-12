import ReactUtils from 'elementor-utils/react';
import { ThemeProvider, DirectionProvider } from '@elementor/ui';
import Checklist from './components/checklist';

export const App = () => {
	let container = document.getElementById( 'e-checklist' );

	if ( ! container ) {
		container = document.createElement( 'div' );
		container.id = 'e-checklist';
		document.body.append( container );
	}

	const isRTL = elementorCommon.config.isRTL;

	if ( ! container.hasChildNodes() ) {
		ReactUtils.render( (
			<DirectionProvider rtl={ isRTL }>
				<ThemeProvider colorScheme="light">
					<Checklist />
				</ThemeProvider>
			</DirectionProvider>
		), container );
	}

	elementor.trigger( 'elementor/editor/panel/checklist/clicked' );
};
