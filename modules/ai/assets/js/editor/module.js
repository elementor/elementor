import AiBehavior from './ai-behavior';
import { __ } from '@wordpress/i18n';
import { IMAGE_PROMPT_CATEGORIES } from './pages/form-media/constants';
import AiPromotionInfotipWrapper from './components/ai-promotion-infotip-wrapper';
import ReactUtils from 'elementor-utils/react';
import { shouldShowPromotionIntroduction } from './utils/promotion-introduction-session-validator';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.hooks.addFilter( 'controls/base/behaviors', this.registerControlBehavior.bind( this ) );
		window.$e.commands.on( 'run:after', ( component, command, args ) => {
			if ( 'document/elements/create' === command ) {
				this.onCreateContainer( args );
			}
		} );
	}

	onCreateContainer( args ) {
		if ( args.container?.id !== 'document' || args.model.elType !== 'container' || args.containers ) {
			return;
		}

		if ( ! shouldShowPromotionIntroduction( sessionStorage ) ) {
			return;
		}

		const element = args.container.view.$el[ 0 ];
		const rootBox = element.getBoundingClientRect();

		if ( ! rootBox || 0 === rootBox.width || 0 === rootBox.height ) {
			return;
		}

		const { x: canvasOffsetX, y: canvasOffsetY } = document.querySelector( '#elementor-preview-iframe' ).getBoundingClientRect();

		setTimeout( () => {
			const rootElement = document.createElement( 'div' );
			document.body.append( rootElement );
			const isPromotion = ! window.ElementorAiConfig.is_get_started;
			const mainActionText = isPromotion ? __( 'Try it for free', 'elementor' ) : __( 'Try it now', 'elementor' );
			const { unmount } = ReactUtils.render( <AiPromotionInfotipWrapper
				test-id="ai-promotion-infotip-wrapper"
				anchor={ element }
				clickAction={ () => {
					window.elementorFrontend.elements.$body.find( '.e-ai-layout-button' ).trigger( 'click' );
				} }
				header={ __( 'Give your workflow a boost.', 'elementor' ) }
				contentText={ __( 'Build containers with AI and generate any layout you’d need for your site’s design.', 'elementor' ) }
				mainActionText={ mainActionText }
				controlType={ 'container' }
				unmountAction={ () => {
					unmount();
				} }
				colorScheme={ elementor?.getPreferences?.( 'ui_theme' ) || 'auto' }
				isRTL={ elementorCommon.config.isRTL }
				placement={ 'bottom' }
				offset={ { x: canvasOffsetX, y: canvasOffsetY } }
			/>, rootElement );
		}, 1000 );
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
					setControlValue: () => {},
					controlView: view,
					additionalOptions: {
						defaultValue: view.options.model.get( 'default' ),
						defaultImageType: aiOptions?.category || IMAGE_PROMPT_CATEGORIES[ 1 ].key,
					},
					context: this.getContextData( view, controlType ),
				};
			}
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
