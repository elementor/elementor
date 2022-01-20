import CommandHistory from 'elementor-document/commands/base/command-history';

export class ConvertAll extends CommandHistory {
	getHistory() {
		return {
			type: __( 'Converted to Containers', 'elementor' ),
			title: __( 'Page', 'elementor' ),
		};
	}

	apply() {
		const { children } = elementor.getPreviewContainer();

		[ ...children ].forEach( ( container ) => {
			$e.run( 'container-converter/convert', { container } );
		} );

		return Promise.resolve();
	}
}
