import ReactUtils from 'elementor-utils/react';
import Checklist from './checklist';

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
			<Checklist
				isRTL={ isRTL }
			/>
		), container );
	}

	elementor.trigger( 'elementor/editor/panel/checklist/clicked' );
};
