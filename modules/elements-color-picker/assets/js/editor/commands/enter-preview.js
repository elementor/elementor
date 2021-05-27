import CommandBase from 'elementor-api/modules/command-base';

export class EnterPreview extends CommandBase {
	apply( args ) {
		const { container, kit } = this.component.currentPicker;

		// Silent
		container.settings.set( control, args.value );

		const { view } = container;

		if ( view?.renderUI ) {
			view.renderUI();
		}

		if ( kit ) {
			const { id } = kit.config,
				cssVar = `--e-global-color-${ container.id }`;

			elementor.$previewContents[ 0 ].querySelector( `.elementor-kit-${ id }` ).style.setProperty( cssVar, args.value );
		}
	}
}
