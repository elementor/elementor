import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { type V1ElementConfig } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { createPropsResolver } from '../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../settings-transformers-registry';
import { getWidgetType } from '../utils/inline-editing-utils';
import { signalizedProcess } from '../utils/signalized-process';
import { widgetRendererRegistry, type MountTrigger } from '../widget-renderer-location';
import { createElementViewClassDeclaration } from './create-element-type';
import { type ElementType, type ElementView, type LegacyWindow } from './types';

type WidgetRendererRegistration = ReturnType< typeof widgetRendererRegistry.getRegistrations >[ number ];

export type CreateTemplatedElementTypeOptions = {
	type: string;
	renderer: DomRenderer;
	element: TemplatedElementConfig;
};

type TemplatedElementConfig = Required<
	Pick< V1ElementConfig, 'twig_templates' | 'twig_main_template' | 'atomic_props_schema' | 'base_styles_dictionary' >
>;

export function createTemplatedElementType( {
	type,
	renderer,
	element,
}: CreateTemplatedElementTypeOptions ): typeof ElementType {
	const legacyWindow = window as unknown as LegacyWindow;

	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return type;
		}

		getView() {
			return createTemplatedElementView( {
				type,
				renderer,
				element,
			} );
		}
	};
}

export function canBeTemplated( element: Partial< TemplatedElementConfig > ): element is TemplatedElementConfig {
	return !! (
		element.atomic_props_schema &&
		element.twig_templates &&
		element.twig_main_template &&
		element.base_styles_dictionary
	);
}

export function createTemplatedElementView( {
	type,
	renderer,
	element,
}: CreateTemplatedElementTypeOptions ): typeof ElementView {
	const BaseView = createElementViewClassDeclaration();

	const templateKey = element.twig_main_template;

	const baseStylesDictionary = element.base_styles_dictionary;

	Object.entries( element.twig_templates ).forEach( ( [ key, template ] ) => {
		renderer.register( key, template );
	} );

	const resolveProps = createPropsResolver( {
		transformers: settingsTransformersRegistry,
		schema: element.atomic_props_schema,
	} );

	return class extends BaseView {
		#abortController: AbortController | null = null;
		customRendererRoot: Root | null = null;

		getTemplateType() {
			return 'twig';
		}

		renderOnChange() {
			this.render();
		}

		render() {
			const widgetType = getWidgetType( this.container );
			const customRenderer = this.#getCustomRenderer( widgetType );

			if ( customRenderer ) {
				return this.#renderWithCustomRenderer( customRenderer );
			}

			this.plainRender();
		}

		/**
		 * Checks the widget renderer registry for a custom renderer matching this widget type.
		 */
		#getCustomRenderer( widgetType: string | null ): WidgetRendererRegistration | null {
			if ( ! widgetType ) {
				return null;
			}

			const registrations = widgetRendererRegistry.getRegistrations();

			return registrations.find( ( { condition } ) => condition( { widgetType } ) ) ?? null;
		}

		/**
		 * Renders the default widget output and sets up the mount trigger.
		 * The trigger determines when the custom React component replaces the default rendering.
		 */
		#renderWithCustomRenderer( registration: WidgetRendererRegistration ) {
			this.plainRender();

			const mountTrigger = registration.mountTrigger ?? this.#defaultMountTrigger;

			mountTrigger( {
				$el: this.$el,
				mount: () => this.#mountCustomRenderer( registration ),
			} );
		}

		#defaultMountTrigger: MountTrigger = ( { $el, mount } ) => {
			$el.on( 'dblclick', '*', ( event: Event ) => {
				event.stopImmediatePropagation();
				$el.off( 'dblclick', '*' );
				mount();
			} );
		};

		/**
		 * Replaces the widget's DOM content with a React component via createPortal.
		 * The custom component receives props for interacting with the legacy Backbone model.
		 */
		#mountCustomRenderer( registration: WidgetRendererRegistration ) {
			this.$el.html( '' );

			if ( ! this.customRendererRoot ) {
				this.customRendererRoot = createRoot( this.el );
			}

			const Component = registration.component;

			this.customRendererRoot.render(
				<Component
					widgetType={ getWidgetType( this.container ) ?? '' }
					container={ this.container }
					el={ this.el }
					model={ this.model }
					reactRoot={ this.customRendererRoot }
					onUnmount={ () => this.#unmountCustomRenderer() }
				/>
			);
		}

		/**
		 * Unmounts the custom renderer and restores the default widget rendering.
		 */
		#unmountCustomRenderer() {
			setTimeout( () => {
				this.#resetCustomRendererRoot();
				this.render();
			} );
		}

		#resetCustomRendererRoot() {
			this.customRendererRoot?.unmount?.();
			this.customRendererRoot = null;
		}

		plainRender() {
			this.#abortController?.abort();
			this.#abortController = new AbortController();

			const process = signalizedProcess( this.#abortController.signal )
				.then( () => this.#beforeRender() )
				.then( () => this._renderTemplate() )
				.then( () => {
					this._renderChildren();
					this.#afterRender();
				} );

			return process.execute();
		}

		// Overriding Marionette original `_renderTemplate` method to inject our renderer.
		async _renderTemplate() {
			this.triggerMethod( 'before:render:template' );

			const process = signalizedProcess( this.#abortController?.signal as AbortSignal )
				.then( ( _, signal ) => {
					const settings = this.model.get( 'settings' ).toJSON();

					return resolveProps( {
						props: settings,
						signal,
					} );
				} )
				.then( ( settings ) => {
					return this.afterSettingsResolve( settings );
				} )
				.then( async ( settings ) => {
					// Same as the Backend.
					const context = {
						id: this.model.get( 'id' ),
						type,
						settings,
						base_styles: baseStylesDictionary,
					};

					return renderer.render( templateKey, context );
				} )
				.then( ( html ) => this.$el.html( html ) );

			await process.execute();

			this.bindUIElements();

			this.triggerMethod( 'render:template' );
		}

		afterSettingsResolve( settings: { [ key: string ]: unknown } ) {
			return settings;
		}

		#beforeRender() {
			this._ensureViewIsIntact();

			this._isRendering = true;

			this.resetChildViewContainer();

			this.triggerMethod( 'before:render', this );
		}

		#afterRender() {
			this._isRendering = false;
			this.isRendered = true;

			this.triggerMethod( 'render', this );
		}
	};
}
