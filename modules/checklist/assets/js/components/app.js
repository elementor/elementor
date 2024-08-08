import ReactUtils from 'elementor-utils/react';
import ChecklistApp from './checklist-app';

export const App = () =>  {

	let container = document.getElementById( 'e-checklist' );

	if ( !container ) {
		container = document.createElement( 'div' );
		container.id = 'e-checklist';
		document.body.append( container );
	}

	const isRTL = elementorCommon.config.isRTL;

	if ( ! container.hasChildNodes() ) {
		ReactUtils.render( (
			<ChecklistApp
				isRTL={ isRTL }
			/>
		), container );
	}

	elementor.trigger( 'elementor/editor/panel/checklist/clicked' );
}

