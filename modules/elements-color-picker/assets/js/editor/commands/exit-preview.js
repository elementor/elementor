import CommandBase from 'elementor-api/modules/command-base';

export class ExitPreview extends CommandBase {
	apply( args ) {
		const { initialColor, container, control, kit } = this.component.currentPicker;

		if ( null === initialColor ) {
			return;
		}

		// Silent
		container.settings.set( control, initialColor );

		const { view } = container;

		if ( view?.renderUI ) {
			view.renderUI();
		}

		if ( kit ) {
			const { id } = kit.config,
				cssVar = `--e-global-color-${ container.id }`;

			elementor.$previewContents[ 0 ].querySelector( `.elementor-kit-${ id }` ).style.setProperty( cssVar, initialColor );
		}
	}
}
