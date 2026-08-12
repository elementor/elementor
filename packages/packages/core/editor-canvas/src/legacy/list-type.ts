import {
  createNestedTemplatedElementType,
  type CreateNestedTemplatedElementTypeOptions,
  createNestedTemplatedElementView,
} from './create-nested-templated-element-type';
import { registerElementType } from './init-legacy-views';
import type { ElementType, ElementView, RenderContext } from './types';

const LIST_TYPE = 'e-list';

function getMemoizedView< T >( viewCreator: () => T ) {
  let cachedView: T | null = null;

  if ( ! cachedView ) {
    cachedView = viewCreator();
  }

  return cachedView;
}

/**
 * Initialize the e-list element type with custom view logic.
 *
 * The list view syncs the show_markers setting from the list to all list items,
 * enabling children dependencies on each item to conditionally show/hide markers.
 */
export function initListType() {
  registerElementType( LIST_TYPE, ( options ) =>
    createListType( options as CreateNestedTemplatedElementTypeOptions )
  );
}

function createListType( options: CreateNestedTemplatedElementTypeOptions ): typeof ElementType {
  const BaseType = createNestedTemplatedElementType( options );

  return class extends BaseType {
    getView() {
      return getMemoizedView( () => createListView( options ) );
    }
  };
}

function createListView( options: CreateNestedTemplatedElementTypeOptions ) {
  const BaseView = createNestedTemplatedElementView( options );

  return BaseView.extend( {
    initialize( this: ElementView, ...args: unknown[] ) {
      BaseView.prototype.initialize?.apply( this, args );

      const settings = this.model.get( 'settings' );
      if ( settings ) {
        this.listenTo( settings, 'change:show_markers', () => {
          this._syncShowMarkersToChildren();
        } );
      }
    },

    onRender( this: ElementView ) {
      BaseView.prototype.onRender?.call( this );
      this._syncShowMarkersToChildren();
    },

    /**
     * Sync show_markers from list to all list items.
     *
     * This propagates the list-level setting to each item, where children dependencies
     * will conditionally add/remove markers based on the value.
     */
    _syncShowMarkersToChildren( this: ElementView ) {
      const settings = this.model.get( 'settings' );
      const showMarkersProp = settings?.get?.( 'show_markers' ) as unknown;
      const showMarkers =
        ( showMarkersProp as { value?: boolean } )?.value ?? showMarkersProp ?? true;

      const children = this.model.get( 'elements' );
      if ( children && children.models ) {
        children.models.forEach( ( childModel: unknown ) => {
          const model = childModel as { get: ( key: string ) => unknown };
          if ( model.get( 'elType' ) === 'e-list-item' ) {
            const childSettings = model.get( 'settings' ) as {
              get?: ( key: string ) => unknown;
              set?: ( key: string, value: unknown ) => void;
            };
            if ( childSettings?.set ) {
              // Check current value to avoid unnecessary updates
              const currentProp = childSettings.get?.( 'show_markers' );
              const currentValue =
                ( currentProp as { value?: boolean } )?.value ?? currentProp ?? true;

              if ( currentValue !== showMarkers ) {
                // Set as prop-value object to match the schema
                childSettings.set( 'show_markers', {
                  $$type: 'boolean',
                  value: showMarkers,
                } );
              }
            }
          }
        } );
      }
    },

    getRenderContext( this: ElementView ): RenderContext | undefined {
      const parentContext = this._parent?.getRenderContext?.();
      const settings = this.model.get( 'settings' );
      const showMarkersProp = settings?.get?.( 'show_markers' ) as unknown;
      const showMarkers =
        ( showMarkersProp as { value?: boolean } )?.value ?? showMarkersProp ?? true;

      return {
        ...parentContext,
        show_markers: showMarkers,
      };
    },

    getResolverRenderContext( this: ElementView ): RenderContext | undefined {
      const parentContext = this._parent?.getResolverRenderContext?.();
      const settings = this.model.get( 'settings' );
      const showMarkersProp = settings?.get?.( 'show_markers' ) as unknown;
      const showMarkers =
        ( showMarkersProp as { value?: boolean } )?.value ?? showMarkersProp ?? true;

      return {
        ...parentContext,
        show_markers: showMarkers,
      };
    },
  } );
}
