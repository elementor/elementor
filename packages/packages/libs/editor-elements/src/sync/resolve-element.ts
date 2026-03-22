import { getContainer } from './get-container';
import { type BackboneCollection, type BackboneModel, type ExtendedWindow, type V1Element } from './types';

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
	childData: Record< string, unknown >,
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

export function rerenderAncestor( ancestorId: string | undefined ): void {
	if ( ! ancestorId ) {
		return;
	}

	const ancestor = getContainer( ancestorId );

	if ( ! ancestor?.view ) {
		return;
	}

	const view = ancestor.view as V1Element[ 'view' ] & {
		render?: () => void;
		invalidateRenderCache?: () => void;
	};

	view.invalidateRenderCache?.();
	view.render?.();
}

export function findAtomicAncestorId( container: V1Element ): string | undefined {
	const extendedWindow = window as unknown as ExtendedWindow;
	const helpers = extendedWindow.elementor?.helpers;

	if ( ! helpers?.isAtomicWidget ) {
		return undefined;
	}

	let current = container.parent;

	while ( current ) {
		if ( helpers.isAtomicWidget( current.model ) ) {
			return current.id;
		}

		current = current.parent;
	}

	return undefined;
}
