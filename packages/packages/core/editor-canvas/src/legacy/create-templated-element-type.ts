import type { V1ElementConfig } from '@elementor/editor-elements';

import { type DomRenderer } from '../renderers/create-dom-renderer';
import { createPropsResolver } from '../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../settings-transformers-registry';
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

	// רושמים את כל תבניות ה-Twig אל הרנדרר פעם אחת עבור ה-View Class.
	Object.entries( element.twig_templates ).forEach( ( [ key, template ] ) => {
		renderer.register( key, template );
	} );

	const resolveProps = createPropsResolver( {
		transformers: settingsTransformersRegistry,
		schema: element.atomic_props_schema,
	} );

	return class extends BaseView {
		#abortController: AbortController | null = null;

		getTemplateType() {
			return 'twig';
		}

		renderOnChange() {
			this.render();
		}

		// Override `render` function to support async `_renderTemplate`
		// Note: `_renderChildren` asynchrony is still NOT supported; only parent element rendering can be async.
		render() {
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

		// Overriding Marionette original `_renderTemplate` to inject our renderer + inline editing handling.
		async _renderTemplate() {
			this.triggerMethod( 'before:render:template' );

			const process = signalizedProcess( this.#abortController?.signal as AbortSignal )
				// 1) שליפת settings מהמודל והרצה דרך ה-resolver (schema + transformers), ניתן לביטול עם signal.
				.then( ( _, signal ) => {
					const settings = this.model.get( 'settings' ).toJSON();

					return resolveProps( {
						props: settings,
						signal,
					} );
				} )
				// 2) hook להרחבות/התאמות אחרי ה-resolve.
				.then( ( settings ) => {
					return this.afterSettingsResolve( settings );
				} )
				// 3) רינדור Twig לקובץ HTML לפי התבנית הראשית + קונטקסט תואם backend.
				.then( async ( settings ) => {
					const context = {
						id: this.model.get( 'id' ),
						type,
						settings,
						base_styles: baseStylesDictionary,
					};

					return renderer.render( templateKey, context );
				} )
				// 4) טיפול נכון ב-inline editing:
				.then( ( html ) => {
					try {
						const parser = new DOMParser();
						const doc = parser.parseFromString( html, 'text/html' );
						const root = doc.body.firstElementChild as HTMLElement | null;
						const isEditable = root?.dataset?.editable === 'true';

						// עדכון מצב inline-editing (אם הנתמך קיים על ה-View).
						( this as any ).setInlineEditing?.( !! isEditable );

						if ( isEditable ) {
							// מצב עריכה: לא מזריקים wrapper; מרנדרים עורך עשיר עם תוכן פנימי.
							const content = root?.innerHTML ?? '';
							this.$el.html( '' );
							( this as any ).renderRichTextEditor?.( content );
						} else {
							// מצב רגיל: מזריקים את ה-HTML כפי שהוא.
							this.$el.html( html );
						}
					} catch {
						// אם parsing נכשל מסיבה כלשהי, נ fallback להזרקה רגילה.
						this.$el.html( html );
						( this as any ).setInlineEditing?.( false );
					}
				} );

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
