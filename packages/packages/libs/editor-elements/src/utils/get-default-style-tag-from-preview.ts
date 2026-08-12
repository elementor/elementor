import { getContainer } from '../sync/get-container';
import { getPreviewElementDOM } from '../sync/get-preview-element-dom';

export const DEFAULT_STYLE_CLASS_PREFIX = 'e-default-';

type AtomicElementView = {
  getDomElement?: () => { get: ( index: number ) => HTMLElement | undefined };
  el?: HTMLElement;
};

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
    const domElement = view.getDomElement().get( 0 );

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

function getContainerView( elementId: string ): AtomicElementView | null {
  return getContainer( elementId )?.view ?? null;
}
