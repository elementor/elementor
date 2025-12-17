import { activate, deactivate, isActive, register, unregister } from '../replacements/registry';
import { type ReplacementType } from '../replacements/types';
import { createTemplatedElementView, type CreateTemplatedElementTypeOptions } from './create-templated-element-type';
import { type ElementView } from './types';

export type ReplacementBridgeConfig = {
	type: ReplacementType;
	shouldActivate: ( view: ElementView ) => boolean;
	activationTrigger?: 'dblclick' | 'click';
	onActivate?: ( view: ElementView ) => void;
	getProps?: ( view: ElementView ) => Record< string, unknown >;
};

export function createReplacementBridge(
	config: ReplacementBridgeConfig,
	options: CreateTemplatedElementTypeOptions
) {
	const TemplatedView = createTemplatedElementView( options );

	return class extends TemplatedView {
		#isInitialized = false;
		#handlerAttached = false;

		render() {
			const elementId = this.container?.id ?? this.model?.get?.( 'id' );

			if ( ! elementId ) {
				TemplatedView.prototype.render.apply( this );
				return;
			}

			if ( isActive( elementId ) ) {
				return;
			}

			if ( ! this.#isInitialized ) {
				let cachedProps: Record< string, unknown > | undefined;

				register( {
					elementId,
					targetElement: this.el,
					type: config.type,
					shouldActivate: () => config.shouldActivate( this ),
					onActivate: () => {
						cachedProps = config.getProps?.( this );
						this.$el.off( config.activationTrigger ?? 'dblclick', '*' );
						this.#handlerAttached = false;
						config.onActivate?.( this );
						this.$el.html( '' );
					},
					getProps: () => cachedProps ?? {},
				} );

				this.#isInitialized = true;
			}

			if ( config.shouldActivate( this ) && ! this.#handlerAttached ) {
				const trigger = config.activationTrigger ?? 'dblclick';
				this.$el.on( trigger, '*', ( event: Event ) => {
					event.stopPropagation();
					activate( elementId );
				} );
				this.#handlerAttached = true;
			}

			TemplatedView.prototype.render.apply( this );
		}

		onDestroy( ...args: unknown[] ) {
			const elementId = this.container?.id ?? this.model?.get?.( 'id' );

			this.$el.off( config.activationTrigger ?? 'dblclick', '*' );

			if ( elementId ) {
				unregister( elementId );
				deactivate( elementId );
			}

			TemplatedView.prototype.onDestroy.apply( this, args );
		}
	};
}

