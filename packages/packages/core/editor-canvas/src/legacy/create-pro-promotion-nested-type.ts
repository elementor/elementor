import {
	canBeNestedTemplated,
	createNestedTemplatedElementType,
	type NestedTemplatedElementConfig,
} from './create-nested-templated-element-type';
import { type CreateTemplatedElementTypeOptions } from './create-templated-element-type';
import { type ElementType, type ElementView, type LegacyWindow } from './types';

export function createProPromotionNestedType( {
	type,
	renderer,
	element,
}: CreateTemplatedElementTypeOptions ): typeof ElementType {
	if ( ! canBeNestedTemplated( element ) ) {
		throw new Error( `Element "${ type }" is not a valid nested templated element.` );
	}

	const BaseType = createNestedTemplatedElementType( {
		type,
		renderer,
		element: element as NestedTemplatedElementConfig,
	} );

	const BaseView = new BaseType().getView();

	const PromotionView = createPromotionView( BaseView );

	return class extends BaseType {
		getView() {
			return PromotionView;
		}
	};
}

function createPromotionView( BaseView: typeof ElementView ): typeof ElementView {
	return class extends BaseView {
		_afterRender() {
			super._afterRender();

			this.$el.off( 'click', '.e-form-placeholder__remove-btn' );
			this.$el.on( 'click', '.e-form-placeholder__remove-btn', ( e: Event ) => {
				e.preventDefault();
				e.stopPropagation();

				( window as unknown as { $e: { run: ( command: string, args: object ) => void } } ).$e.run(
					'document/elements/delete',
					{ container: this.container }
				);
			} );
		}

		_renderChildren() {}

		behaviors() {
			const disabledBehaviors = [ 'InlineEditing', 'Draggable', 'Resizable' ];

			const behaviorsAsEntries = Object.entries( super.behaviors() ).filter(
				( [ key ] ) => ! disabledBehaviors.includes( key )
			);

			return Object.fromEntries( behaviorsAsEntries );
		}

		getHandlesOverlay() {
			return null;
		}

		getContextMenuGroups() {
			return super.getContextMenuGroups().filter( ( group: { name: string } ) => group.name !== 'save' );
		}

		onDestroy( ...args: unknown[] ) {
			super.onDestroy( ...args );
			this.$el.off( 'click', '.e-form-placeholder__remove-btn' );
		}
	} as unknown as typeof ElementView;
}
