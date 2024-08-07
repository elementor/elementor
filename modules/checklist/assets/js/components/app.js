import ReactUtils from 'elementor-utils/react';
import ChecklistApp from './checklist-app';

export const App = () =>  {

	const container = document.createElement( 'div' ),
		isRTL = elementorCommon.config.isRTL;

	document.body.append( container );

	ReactUtils.render( (
		<ChecklistApp
			isRTL={ isRTL }
		/>
	), container );

	elementor.trigger( 'elementor/editor/panel/checklist/clicked' );

}
