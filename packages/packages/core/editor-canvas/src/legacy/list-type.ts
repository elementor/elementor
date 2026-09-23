import {
	createNestedTemplatedElementType,
	type CreateNestedTemplatedElementTypeOptions,
	createNestedTemplatedElementView,
} from './create-nested-templated-element-type';
import { registerElementType } from './init-legacy-views';
import type { ElementType, RenderContext } from './types';

const LIST_TYPE = 'e-list';

/**
 * Initialize the e-list element type with custom render context.
 */
export function initListType() {
	registerElementType( LIST_TYPE, ( options ) =>
		createListType( options as CreateNestedTemplatedElementTypeOptions )
	);
}

function createListType( options: CreateNestedTemplatedElementTypeOptions ): typeof ElementType {
	const BaseType = createNestedTemplatedElementType( options );
	let ListView: ReturnType< typeof createListView > | null = null;

	return class extends BaseType {
		getView() {
			if ( ! ListView ) {
				ListView = createListView( options );
			}

			return ListView;
		}
	};
}

function createListView( options: CreateNestedTemplatedElementTypeOptions ) {
	const BaseView = createNestedTemplatedElementView( options );

	return BaseView.extend( {
		getRenderContext(): RenderContext | undefined {
			const parentContext = this._parent?.getRenderContext?.();
			const settings = this.model.get( 'settings' );
			const showMarkersProp = settings?.get?.( 'show_markers' ) as unknown;
			const showMarkers = ( showMarkersProp as { value?: boolean } )?.value ?? showMarkersProp ?? true;

			return {
				...parentContext,
				show_markers: showMarkers,
			};
		},

		getResolverRenderContext(): RenderContext | undefined {
			const parentContext = this._parent?.getResolverRenderContext?.();
			const settings = this.model.get( 'settings' );
			const showMarkersProp = settings?.get?.( 'show_markers' ) as unknown;
			const showMarkers = ( showMarkersProp as { value?: boolean } )?.value ?? showMarkersProp ?? true;

			return {
				...parentContext,
				show_markers: showMarkers,
			};
		},
	} );
}
