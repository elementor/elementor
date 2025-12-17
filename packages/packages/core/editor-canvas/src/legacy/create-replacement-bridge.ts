import { activate, deactivate, isActive, isRegistered, register, unregister } from '../replacements/registry';
import { type ReplacementType } from '../replacements/types';
import { createTemplatedElementView, type CreateTemplatedElementTypeOptions } from './create-templated-element-type';
import { type ElementView, type LegacyWindow } from './types';

type ReplacementBridgeConfig = {
	type: ReplacementType;
	shouldActivate: ( view: ElementView ) => boolean;
	activationTrigger?: 'dblclick' | 'click';
	onActivate?: ( view: ElementView ) => void;
	getProps?: ( view: ElementView ) => Record< string, unknown >;
};

const legacyWindow = window as unknown as LegacyWindow;

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

			if ( elementId ) {
				const isCurrentlyActive = isActive( elementId );

				if ( isCurrentlyActive ) {
					return;
				}

				if ( ! this.#isInitialized ) {
					register( {
						elementId,
						targetElement: this.el,
						type: config.type,
						shouldActivate: () => config.shouldActivate( this ),
						onActivate: () => {
							this.$el.off( config.activationTrigger ?? 'dblclick', '*' );
							this.#handlerAttached = false;
							config.onActivate?.( this );
							this.$el.html( '' );
						},
						props: config.getProps?.( this ),
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
			} else {
				TemplatedView.prototype.render.apply( this );
			}
		}

		onDestroy( ...args: unknown[] ) {
			this.$el.off( 'dblclick', '*' );

			if ( this.container?.id ) {
				unregister( this.container.id );
				deactivate( this.container.id );
			}

			TemplatedView.prototype.onDestroy.apply( this, args );
		}
	};
}

