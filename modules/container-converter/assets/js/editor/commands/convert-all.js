export class ConvertAll extends $e.modules.document.CommandHistory {
	getHistory() {
		return {
			type: __( 'Converted to Containers', 'elementor' ),
			title: __( 'All Content', 'elementor' ),
		};
	}

	apply() {
		const { children } = elementor.getPreviewContainer();

		[ ...children ].forEach( ( container ) => {
			$e.run( 'container-converter/convert', { container } );
		} );
	}
}
