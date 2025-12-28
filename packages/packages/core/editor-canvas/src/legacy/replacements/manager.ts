import type { CreateTemplatedElementTypeOptions } from '../create-templated-element-type';
import { createTemplatedElementView } from '../create-templated-element-type';
import type { ElementType, ElementView, LegacyWindow, ReplacementSettings } from '../types';
import type ReplacementBase from './base';
import { type ReplacementBaseInterface } from './base';
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
				refreshView: this.render.bind( this ),
			};
		}

		refreshView() {
			this.render();
		}

		renderOnChange(): void {
			if ( this.#replacement?.shouldRenderReplacement() && this.#replacement?.renderOnChange ) {
				this.#replacement.renderOnChange();
			} else {
				TemplatedView.prototype.renderOnChange.apply( this );
			}
		}

		render() {
			const config = this.#config;
			const widgetType = config.type;
			const ReplacementClass = widgetType ? getReplacement( widgetType ) : null;

			if ( ReplacementClass && ! this.#replacement ) {
				this.#replacement = new ReplacementClass( config );
			}

			if ( this.#replacement?.shouldRenderReplacement() && this.#replacement.render ) {
				return this.#replacement.render();
			}

			return TemplatedView.prototype.render.apply( this );
		}

		onDestroy() {
			if ( this.#replacement?.shouldRenderReplacement() && this.#replacement?.onDestroy ) {
				this.#replacement.onDestroy();
				this.#replacement = null;
			}

			TemplatedView.prototype.onDestroy.apply( this );
		}

		_afterRender() {
			if ( this.#replacement?.shouldRenderReplacement() && this.#replacement?._afterRender ) {
				this.#replacement._afterRender();
			} else {
				TemplatedView.prototype._afterRender.apply( this );
			}
		}

		_beforeRender(): void {
			if ( this.#replacement?.shouldRenderReplacement() && this.#replacement?._beforeRender ) {
				this.#replacement._beforeRender();
			} else {
				TemplatedView.prototype._beforeRender.apply( this );
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

	return class extends legacyWindow.elementor.modules.elements.types.Widget {
		getType() {
			return type;
		}

		getView() {
			return createViewWithReplacements( {
				type,
				renderer,
				element,
			} );
		}
	};
};
