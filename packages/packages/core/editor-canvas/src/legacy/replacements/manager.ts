import {
	type CreateNestedTemplatedElementTypeOptions,
	createNestedTemplatedElementView,
} from '../create-nested-templated-element-type';
import type { CreateTemplatedElementTypeOptions } from '../create-templated-element-type';
import { createTemplatedElementView } from '../create-templated-element-type';
import type { ElementType, ElementView, LegacyWindow, ReplacementSettings } from '../types';
import { type ReplacementBase, type ReplacementBaseInterface, type TriggerMethod } from './base';
import InlineEditingReplacement from './inline-editing/inline-editing-elements';

type ReplacementConstructor = new ( settings: ReplacementSettings ) => ReplacementBase;

const replacements = new Map< string, ReplacementConstructor >();

export const initViewReplacements = () => {
	registerReplacement( InlineEditingReplacement );
};

export const registerReplacement = ( replacement: typeof ReplacementBase ) => {
	const types = replacement.getTypes();

	if ( ! types ) {
		return;
	}

	types.forEach( ( type ) => {
		replacements.set( type, replacement );
	} );
};

export const getReplacement = ( type: string ) => {
	return replacements.get( type ) ?? null;
};

export const createViewWithReplacements = ( options: CreateTemplatedElementTypeOptions ): typeof ElementView => {
	const TemplatedView = createTemplatedElementView( options );

	return class extends TemplatedView {
		#replacement: ReplacementBaseInterface | null = null;
		#config: ReplacementSettings;

		constructor( ...args: unknown[] ) {
			super( ...args );
			const settings = this.model.get( 'settings' );

			this.#config = {
				getSetting: settings.get.bind( settings ),
				setSetting: settings.set.bind( settings ),
				element: this.el,
				type: this?.model?.get( 'widgetType' ) ?? this.container?.model?.get( 'elType' ) ?? null,
				id: this?.model?.get( 'id' ) ?? null,
				refreshView: this.refreshView.bind( this ),
			};
		}

		refreshView() {
			this.invalidateRenderCache?.();
			this.render();
		}

		renderOnChange(): void {
			this.#triggerAltMethod( 'renderOnChange' );
		}

		render() {
			const config = this.#config;
			const widgetType = config.type;
			const ReplacementClass = widgetType ? getReplacement( widgetType ) : null;

			if ( ReplacementClass && ! this.#replacement ) {
				this.#replacement = new ReplacementClass( config );
			}

			this.#triggerAltMethod( 'render' );
		}

		onDestroy() {
			this.#triggerAltMethod( 'onDestroy' );
		}

		_afterRender() {
			this.#triggerAltMethod( '_afterRender' );
		}

		_beforeRender(): void {
			this.#triggerAltMethod( '_beforeRender' );
		}

		#triggerAltMethod( methodKey: keyof ReplacementBaseInterface ) {
			const baseMethod = TemplatedView.prototype[ methodKey as TriggerMethod ].bind( this );
			const shouldReplace = this.#replacement?.shouldRenderReplacement();
			const altMethod = shouldReplace && this.#replacement?.[ methodKey ]?.bind( this.#replacement );

			if ( ! altMethod || ! shouldReplace ) {
				return baseMethod();
			}

			const renderTiming = this.#replacement?.originalMethodsToTrigger()[ methodKey as TriggerMethod ] ?? 'never';

			if ( renderTiming === 'before' ) {
				baseMethod();
			}

			altMethod();

			if ( renderTiming === 'after' ) {
				baseMethod();
			}
		}
	};
};

export const createTemplatedElementTypeWithReplacements = ( {
	type,
	renderer,
	element,
}: CreateTemplatedElementTypeOptions ): typeof ElementType => {
	const legacyWindow = window as unknown as LegacyWindow;

	const view = createViewWithReplacements( {
		type,
		renderer,
		element,
	} );

	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return type;
		}

		getView() {
			return view;
		}
	};
};

type NestedViewInstance = ElementView & {
	emptyView: null;
	_replacement: ReplacementBaseInterface | null;
	_replacementConfig: ReplacementSettings | null;
	_initReplacementConfig: () => void;
	_getOrCreateReplacement: () => ReplacementBaseInterface | null;
	_triggerAltMethod: ( methodKey: keyof ReplacementBaseInterface, ...args: unknown[] ) => void;
};

type ExtendableView = {
	extend: ( props: object & ThisType< NestedViewInstance > ) => typeof ElementView;
	prototype: Record< string, ( ...args: unknown[] ) => unknown >;
};

export const createNestedViewWithReplacements = ( {
	type,
	renderer,
	element,
	modelExtensions,
}: CreateNestedTemplatedElementTypeOptions ): typeof ElementView => {
	const options = { type, renderer, element, modelExtensions };
	const NestedView = createNestedTemplatedElementView( options ) as unknown as ExtendableView;

	return NestedView.extend( {
		emptyView: null,

		_replacement: null as ReplacementBaseInterface | null,
		_replacementConfig: null as ReplacementSettings | null,

		_initReplacementConfig() {
			if ( this._replacementConfig ) {
				return;
			}

			const settings = this.model.get( 'settings' );

			this._replacementConfig = {
				getSetting: ( key: string ) => settings.get( key as never ),
				setSetting: ( key: string, value: unknown ) => settings.set( key as never, value as never ),
				element: this.el,
				type: this.model?.get( 'widgetType' ) ?? this.model?.get( 'elType' ) ?? null,
				id: this.model?.get( 'id' ) ?? null,
				refreshView: () => {
					this.invalidateRenderCache?.();
					this.render();
				},
			};
		},

		_getOrCreateReplacement(): ReplacementBaseInterface | null {
			this._initReplacementConfig();

			const elementType = this._replacementConfig?.type;

			if ( elementType && ! this._replacement ) {
				const ReplacementClass = getReplacement( elementType );

				if ( ReplacementClass ) {
					this._replacement = new ReplacementClass( this._replacementConfig as ReplacementSettings );
				}
			}

			return this._replacement;
		},

		_triggerAltMethod( methodKey: keyof ReplacementBaseInterface, ...args: unknown[] ) {
			const baseMethod = NestedView.prototype[ methodKey ]?.bind( this );
			const replacement = this._getOrCreateReplacement();
			const shouldReplace = replacement?.shouldRenderReplacement();
			const altMethod = shouldReplace && replacement?.[ methodKey ]?.bind( replacement );

			if ( ! altMethod || ! shouldReplace ) {
				return baseMethod?.( ...args );
			}

			const renderTiming = replacement?.originalMethodsToTrigger()[ methodKey as TriggerMethod ] ?? 'never';

			if ( renderTiming === 'before' ) {
				baseMethod?.( ...args );
			}

			altMethod();

			if ( renderTiming === 'after' ) {
				baseMethod?.( ...args );
			}
		},

		render() {
			this._triggerAltMethod( 'render' );
		},

		renderOnChange( ...args: unknown[] ) {
			this._triggerAltMethod( 'renderOnChange', ...args );
		},

		onDestroy() {
			this._triggerAltMethod( 'onDestroy' );
		},

		_afterRender() {
			this._triggerAltMethod( '_afterRender' );
		},

		_beforeRender() {
			this._triggerAltMethod( '_beforeRender' );
		},
	} );
};

export const createNestedTemplatedElementTypeWithReplacements = ( {
	type,
	renderer,
	element,
	modelExtensions,
}: CreateNestedTemplatedElementTypeOptions ): typeof ElementType => {
	const legacyWindow = window as unknown as LegacyWindow;

	const view = createNestedViewWithReplacements( { type, renderer, element, modelExtensions } );

	return class extends legacyWindow.elementor.modules.elements.types.Base {
		getType() {
			return type;
		}

		getView() {
			return view;
		}

		getModel() {
			const BaseModel = legacyWindow.elementor.modules.elements.models.AtomicElementBase;

			if ( modelExtensions && Object.keys( modelExtensions ).length > 0 ) {
				return BaseModel.extend( modelExtensions ) as typeof BaseModel;
			}

			return BaseModel;
		}
	};
};
