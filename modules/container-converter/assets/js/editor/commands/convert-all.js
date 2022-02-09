import CommandHistoryBase from 'elementor-document/command-bases/command-history-base';

export class ConvertAll extends CommandHistoryBase {
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
