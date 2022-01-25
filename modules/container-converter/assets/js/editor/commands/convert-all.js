import CommandHistory from 'elementor-document/commands/base/command-history';

export class ConvertAll extends CommandHistory {
	getHistory() {
		return {
			type: __( 'All Content', 'elementor' ),
			title: __( 'Page', 'elementor' ),
		};
	}

	apply() {
		const { children } = elementor.getPreviewContainer();

		[ ...children ].forEach( ( container ) => {
			$e.run( 'container-converter/convert', { container } );
		} );
	}
}
