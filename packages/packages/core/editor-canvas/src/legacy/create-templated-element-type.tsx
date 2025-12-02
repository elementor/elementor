import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { InlineEditor } from '@elementor/editor-controls';
import { getElementType, type V1ElementConfig } from '@elementor/editor-elements';
import { htmlPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { createPropsResolver } from '../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../settings-transformers-registry';
import {
	getHtmlPropType,
	getInlineEditablePropertyName,
	getWidgetType,
	hasInlineEditableProperty,
} from '../utils/inline-editing-utils';
import { signalizedProcess } from '../utils/signalized-process';
import { createElementViewClassDeclaration } from './create-element-type';
import { type ElementType, type ElementView, type LegacyWindow } from './types';

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
		inlineEditorRoot: Root | null = null;

		getTemplateType() {
			return 'twig';
		}

		renderOnChange() {
			this.render();
		}

		// Override `render` function to support async `_renderTemplate`
		// Note that `_renderChildren` asynchronity is still NOT supported, so only the parent element rendering can be async
		render() {
			if ( hasInlineEditableProperty( this.model.get( 'id' ) ) ) {
				return this.injectInlineEditorHandle();
			}

			this.plainRender();
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

		injectInlineEditorHandle() {
			if ( this.inlineEditorRoot ) {
				this.resetInlineEditorRoot();
			} else {
				this.$el.on( 'dblclick', '*', this.handleRenderInlineEditor.bind( this ) );
			}

			this.plainRender();
		}

		handleRenderInlineEditor( event: Event ) {
			event.stopImmediatePropagation();
			this.$el.off( 'dblclick', '*' );
			this.renderInlineEditor();
		}

		handleUnmountInlineEditor( event: Event ) {
			event.stopImmediatePropagation();
			this.unmountInlineEditor();
		}

		renderInlineEditor() {
			const prop = getHtmlPropType( this.container );
			const settingKey = getInlineEditablePropertyName( this.container );
			const settingValue =
				htmlPropTypeUtil.extract( this.model.get( 'settings' )?.get( settingKey ) ?? null ) ??
				htmlPropTypeUtil.extract( prop?.default ?? null ) ??
				'';
			const classes = this.el?.children?.[ 0 ]?.classList.toString();

			const setValue = ( value: string ) => {
				this.model.get( 'settings' )?.set( settingKey, htmlPropTypeUtil.create( value ) );
			};

			this.$el.html( '' );

			if ( ! this.inlineEditorRoot ) {
				this.inlineEditorRoot = createRoot( this.el );
			} else {
				this.resetInlineEditorRoot();
			}

			const formatValue = () => {
				const widgetType = getWidgetType( this.container );

				if ( ! widgetType ) {
					return settingValue;
				}

				const propsSchema = getElementType( widgetType )?.propsSchema;

				if ( ! propsSchema?.tag ) {
					return settingValue;
				}

				const getProperlyTaggedValue =
					stringPropTypeUtil.extract( this.model.get( 'settings' ).get( 'tag' ) ?? null ) ??
					stringPropTypeUtil.extract( propsSchema.tag.default ?? null );

				if ( ! getProperlyTaggedValue ) {
					return settingValue;
				}

				if ( settingValue?.trim().startsWith( `<${ getProperlyTaggedValue }` ) ) {
					return settingValue;
				}

				return `<${ getProperlyTaggedValue }>${ settingValue }</${ getProperlyTaggedValue }>`;
			};

			this.inlineEditorRoot.render(
				<InlineEditor
					attributes={ { class: classes } }
					value={ formatValue() }
					setValue={ setValue }
					onBlur={ this.handleUnmountInlineEditor.bind( this ) }
					autofocus
				/>
			);
		}

		unmountInlineEditor() {
			setTimeout( () => {
				this.resetInlineEditorRoot();
				this.render();
			} );
		}

		resetInlineEditorRoot() {
			this.inlineEditorRoot?.unmount?.();
			this.inlineEditorRoot = null;
		}
	};
}
