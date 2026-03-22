import { getContainer } from './get-container';
import {
	type BackboneCollection,
	type BackboneModel,
	type ExtendedWindow,
	type V1Element,
	type V1ElementModelProps,
} from './types';

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

export function findModelInDocTree( id: string ): BackboneModel | null {
	const extendedWindow = window as unknown as ExtendedWindow;
	const findModelById = extendedWindow.$e?.components?.get?.( 'document' )?.utils?.findModelById;

	if ( ! findModelById ) {
		return null;
	}

	return findModelById( id );
}

export function addModelToParent(
	parentId: string,
	childData: V1ElementModelProps,
	options?: { at?: number }
): boolean {
	const parentModel = findModelInDocTree( parentId );

	if ( ! parentModel ) {
		return false;
	}

	const elements = parentModel.get( 'elements' ) as BackboneCollection | undefined;

	if ( ! elements ) {
		return false;
	}

	elements.add( childData, { at: options?.at, silent: true } );

	return true;
}

export function removeModelFromParent( parentId: string, childId: string ): boolean {
	const parentModel = findModelInDocTree( parentId );

	if ( ! parentModel ) {
		return false;
	}

	const elements = parentModel.get( 'elements' ) as BackboneCollection | undefined;

	if ( ! elements ) {
		return false;
	}

	const child = elements.findWhere( { id: childId } );

	if ( ! child ) {
		return false;
	}

	elements.remove( child, { silent: true } );

	return true;
}
