import CommandHistory from 'elementor-document/commands/base/command-history';

export class ConvertAll extends CommandHistory {
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
