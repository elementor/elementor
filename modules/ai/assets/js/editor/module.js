import AiBehavior from './ai-behavior';
import { __ } from '@wordpress/i18n';
import { IMAGE_PROMPT_CATEGORIES } from './pages/form-media/constants';
import ReactUtils from 'elementor-utils/react';
import LayoutAppWrapper from './layout-app-wrapper';
import { AiGetStartedConnect } from './ai-get-started-connect';
import { getUiConfig } from './utils/editor-integration';
import { getRemoteFrontendConfig } from './api';
import { getUniqueId } from './context/requests-ids';
import ApplyAiTitlesNavigatorBehavior from './integration/navigator/apply-ai-titles-to-navigator-behaviour';

setTimeout( async () => {
	if ( '1' !== window.ElementorAiConfig?.is_get_started ) {
		return;
	}

	window.EDITOR_SESSION_ID = window.EDITOR_SESSION_ID || getUniqueId( 'elementor-editor-session' );

	try {
		const config = await getRemoteFrontendConfig( {
			client_name: 'elementor-editor-loading',
			client_version: elementorCommon.config.version,
			client_session_id: window.EDITOR_SESSION_ID,
		},
		true,
		);

		window.ElementorAIRemoteConfigData = config;

		if ( config?.remoteIntegrationUrl ) {
			// Add a script tag to the head of the document
			const script = document.createElement( 'script' );
			script.type = 'module';
			script.src = config.remoteIntegrationUrl;
			document.head.appendChild( script );
		}
	} catch ( e ) {
		// eslint-disable-next-line no-console
		console.error( 'Elementor AI Integration Loader', e );
	}
}, 0 );

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInit() {
		elementor.hooks.addFilter( 'controls/base/behaviors', this.registerControlBehavior.bind( this ) );
		elementor.hooks.addFilter( 'navigator/layout/behaviors', this.registerNavigatorBehavior.bind( this ) );

		window.addEventListener( 'hashchange', function( e ) {
			if ( e.newURL.includes( 'welcome-ai' ) ) {
				const source = e.newURL.includes( 'welcome-ai-whats-new' ) ? 'whats-new' : 'connect';
				const returnTo = e.newURL.includes( 'return-to' ) ? e.newURL.split( 'return-to-' )[ 1 ] : '';
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
								} }
								newHashOnConnect={ returnTo }
								source={ source }
							/>
						</LayoutAppWrapper>, rootElement );
				}, 1000 );
			}
		} );
	}

	registerNavigatorBehavior( behaviors ) {
		behaviors.ai = {
			behaviorClass: ApplyAiTitlesNavigatorBehavior,
		};
		return behaviors;
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
