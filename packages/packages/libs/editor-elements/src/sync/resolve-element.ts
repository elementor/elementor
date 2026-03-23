import { getContainer } from './get-container';
import { type BackboneModel, type ExtendedWindow, type V1Element, type V1ElementModelProps } from './types';

function isConnected( container: V1Element | null | undefined ): container is V1Element {
	if ( ! container ) {
		return false;
	}

	if ( ! container.view?.el ) {
		return true;
	}

	return container.view.el.isConnected;
}

export function resolveContainer( container: V1Element, id: string ): V1Element | null {
	const looked = container.lookup?.();

	if ( isConnected( looked ) ) {
		return looked;
	}

	const byId = getContainer( id );

	if ( isConnected( byId ) ) {
		return byId;
	}

	return null;
}

function getDocumentUtils() {
	return ( window as unknown as ExtendedWindow ).$e?.components?.get?.( 'document' )?.utils;
}

export function findModelInDocument( id: string ): BackboneModel | null {
	return getDocumentUtils()?.findModelById?.( id ) ?? null;
}

export function addModelToParent(
	parentId: string,
	childData: V1ElementModelProps,
	options?: { at?: number }
): boolean {
	return getDocumentUtils()?.addModelToParent?.( parentId, childData, options ) ?? false;
}

export function removeModelFromParent( parentId: string, childId: string ): boolean {
	return getDocumentUtils()?.removeModelFromParent?.( parentId, childId ) ?? false;
}
