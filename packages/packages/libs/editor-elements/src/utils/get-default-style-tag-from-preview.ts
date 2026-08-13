import { getContainer } from '../sync/get-container';
import { getPreviewElementDOM } from '../sync/get-preview-element-dom';
import { type V1Element } from '../sync/types';

export const DEFAULT_STYLE_CLASS_PREFIX = 'e-default-';

export function parseDefaultStyleTagFromClassList( classList: DOMTokenList ): string | null {
  for ( const className of classList ) {
    if ( className.startsWith( DEFAULT_STYLE_CLASS_PREFIX ) ) {
      return className.slice( DEFAULT_STYLE_CLASS_PREFIX.length );
    }
  }

  return null;
}

export function getDefaultStyleTagFromPreviewElement( elementId: string ): string | null {
  const renderRoot = getAtomicElementRenderRoot( elementId );

  if ( ! renderRoot ) {
    return null;
  }

  return parseDefaultStyleTagFromClassList( renderRoot.classList );
}

function getAtomicElementRenderRoot( elementId: string ): HTMLElement | null {
  const view = getContainerView( elementId );

  if ( view?.getDomElement ) {
    const domElement = view.getDomElement().get?.( 0 );

    if ( domElement ) {
      return domElement;
    }
  }

  const wrapper = view?.el ?? getPreviewElementDOM( elementId );

  if ( ! wrapper ) {
    return null;
  }

  if ( wrapper.hasAttribute( 'data-id' ) ) {
    return wrapper;
  }

  const firstChild = wrapper.firstElementChild;

  if ( firstChild instanceof HTMLElement ) {
    return firstChild;
  }

  return wrapper;
}

function getContainerView( elementId: string ): V1Element[ 'view' ] | null {
  return getContainer( elementId )?.view ?? null;
}
