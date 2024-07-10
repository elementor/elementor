import AiBehavior from './ai-behavior';
import { __ } from '@wordpress/i18n';
import { IMAGE_PROMPT_CATEGORIES } from './pages/form-media/constants';
import ReactUtils from 'elementor-utils/react';
import LayoutAppWrapper from './layout-app-wrapper';
import { AiGetStartedConnect } from './ai-get-started-connect';
import { getUiConfig } from './utils/editor-integration';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.hooks.addFilter( 'controls/base/behaviors', this.registerControlBehavior.bind( this ) );
		window.addEventListener( 'hashchange', function( e ) {
			if ( e.newURL.includes( 'welcome-ai' ) ) {
				window.location.hash = '';

				setTimeout( () => {
					const rootElement = document.createElement( 'div' );
					document.body.append( rootElement );
					const { colorScheme, isRTL } = getUiConfig();
					const { unmount } = ReactUtils.render(

						<LayoutAppWrapper
							isRTL={ isRTL }
							colorScheme={ colorScheme }>
							<AiGetStartedConnect
								onClose={ () => {
									unmount();
									rootElement.remove();
								} } />
						</LayoutAppWrapper>, rootElement );
				}, 1000 );
			}
		} );
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
				context: this.getContextData( view, controlType ),
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
				context: this.getContextData( view, controlType ),
			};
		}

		const mediaControl = [ 'media' ];
		if ( mediaControl.includes( aiOptions.type ) ) {
			const mediaTypes = view.options.model.get( 'media_types' );

			if ( mediaTypes.length && mediaTypes.includes( 'image' ) ) {
				behaviors.ai = {
					behaviorClass: AiBehavior,
					type: aiOptions.type,
					buttonLabel: __( 'Create with AI', 'elementor' ),
					getControlValue: view.getControlValue.bind( view ),
					setControlValue: ( image ) => {
						view.setSettingsModel( image );
						view.applySavedValue();
					},
					controlView: view,
					additionalOptions: {
						defaultValue: view.options.model.get( 'default' ),
						defaultImageType: aiOptions?.category || IMAGE_PROMPT_CATEGORIES[ 1 ].key,
					},
					context: this.getContextData( view, controlType ),
				};
			}
		}

		if ( 'excerpt' === aiOptions.type ) {
			behaviors.ai = {
				behaviorClass: AiBehavior,
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
				context: this.getContextData( view, controlType ),
			};
		}

		return behaviors;
	}

	getContextData( view, controlType ) {
		const controlName = view.options.model.get( 'name' );

		if ( ! view.options.container ) {
			return {
				controlName,
				controlType,
			};
		}

		return {
			documentType: view.options.container.document.config.type,
			elementType: view.options.container.args.model.get( 'elType' ),
			elementId: view.options.container.id,
			widgetType: view.options.container.args.model.get( 'widgetType' ),
			controlName,
			controlType,
			controlValue: view.options.container.settings.get( controlName ),
		};
	}
}
