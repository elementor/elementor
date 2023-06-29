import AiBehavior from './ai-behavior';
import AiPromotionBehavior from './ai-promotion-behavior';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.hooks.addFilter( 'controls/base/behaviors', this.registerControlBehavior );
	}

	registerControlBehavior( behaviors, view ) {
		const aiOptions = view.options.model.get( 'ai' );

		if ( ! aiOptions?.active ) {
			return behaviors;
		}

		const controlType = view.options.model.get( 'type' );
		const textControls = [ 'text', 'textarea' ];

		if ( textControls.includes( aiOptions.type ) ) {
			behaviors.ai = {
				behaviorClass: AiBehavior,
				controlType,
				type: aiOptions.type,
				getControlValue: view.getControlValue.bind( view ),
				setControlValue: ( value ) => {
					if ( 'wysiwyg' === controlType ) {
						value = value.replaceAll( '\n', '<br>' );
					}

					view.setSettingsModel( value );
					view.applySavedValue();
				},
				isLabelBlock: view.options.model.get( 'label_block' ),
				additionalOptions: {
					defaultValue: view.options.model.get( 'default' ),
				},
			};
		}

		const codeControls = [ 'code' ];
		if ( codeControls.includes( aiOptions.type ) ) {
			const htmlMarkup = view.options?.container?.view?.$el ? view.options.container.view.$el[ 0 ].outerHTML : '';

			behaviors.ai = {
				behaviorClass: AiBehavior,
				type: aiOptions.type,
				additionalOptions: {
					codeLanguage: aiOptions?.language || view.options.model.get( 'language' ),
					htmlMarkup,
					elementId: view.options.container.id,
				},
				buttonLabel: __( 'Code with AI', 'elementor' ),
				isLabelBlock: view.options.model.get( 'label_block' ),
				getControlValue: view.getControlValue.bind( view ),
				setControlValue: ( value ) => view.editor.setValue( value, -1 ),
			};
		}

		const mediaControl = [ 'media' ];
		if ( mediaControl.includes( aiOptions.type ) ) {
			behaviors.ai = {
				behaviorClass: AiPromotionBehavior,
			};
		}

		return behaviors;
	}
}
