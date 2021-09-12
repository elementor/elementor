import After from 'elementor-api/modules/hooks/data/after';

export default class UpdatePanelPage extends After {
	apply( args ) {
		const selectedElements = elementor.getSelectedElements();

		if ( 1 === selectedElements.length ) {
			$e.run( 'panel/editor/open', {
				model: selectedElements[ 0 ].model,
				view: selectedElements[ 0 ].view,
			} );
		} else {
			$e.internal( 'panel/open-default', {
				autoFocusSearch: false,
			} );
		}
	}
}
