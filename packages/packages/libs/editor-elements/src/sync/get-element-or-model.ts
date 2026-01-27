import { type ExtendedWindow, type V1Element } from './types';

type V1Model = V1Element[ 'model' ];

export type ElementOrModel = {
	container: V1Element | null;
	model: V1Model;
};

/**
 * Get an element container by ID, with fallback to model.
 * Useful when nested elements render children asynchronously -
 * the model exists but the container/view may not be ready yet.
 * @param id
 * @param parentModel
 */
export function getContainerOrModel( id: string, parentModel?: V1Model ): ElementOrModel | null {
	const extendedWindow = window as unknown as ExtendedWindow;
	const container = extendedWindow.elementor?.getContainer?.( id ) ?? null;

	if ( container ) {
		return { container, model: container.model };
	}

	if ( parentModel ) {
		const childModels = parentModel.get( 'elements' ) ?? [];
		const model = childModels.find( ( m ) => m.get( 'id' ) === id );

		if ( model ) {
			return { container: null, model };
		}
	}

	return null;
}

/**
 * Recursively find a child element by predicate.
 * Works with both rendered containers (via children) and unrendered models (via model.get('elements')).
 * Note: Only searches children, not the element itself (matching original findRecursive behavior).
 * @param element
 * @param model
 * @param predicate
 */
export function findChildRecursive(
	element: V1Element | null,
	model: V1Model,
	predicate: ( model: V1Model ) => boolean
): ElementOrModel | null {
	// Use container.children if available (rendered elements)
	if ( element?.children?.length ) {
		for ( const child of element.children ) {
			if ( predicate( child.model ) ) {
				return { container: child, model: child.model };
			}

			const found = findChildRecursive( child, child.model, predicate );

			if ( found ) {
				return found;
			}
		}

		return null;
	}

	// Fall back to model.get('elements') for unrendered children
	const childModels = ( model.get( 'elements' ) ?? [] ) as V1Model[];

	for ( const childModel of childModels ) {
		if ( predicate( childModel ) ) {
			const childId = childModel.get( 'id' ) as string;
			const extendedWindow = window as unknown as ExtendedWindow;
			const childContainer = extendedWindow.elementor?.getContainer?.( childId ) ?? null;
			return { container: childContainer, model: childModel };
		}

		const childId = childModel.get( 'id' ) as string;
		const extendedWindow = window as unknown as ExtendedWindow;
		const childContainer = extendedWindow.elementor?.getContainer?.( childId ) ?? null;
		const found = findChildRecursive( childContainer, childModel, predicate );

		if ( found ) {
			return found;
		}
	}

	return null;
}

/**
 * Get all children of an element.
 * Works with both rendered containers and unrendered models.
 * @param element
 * @param model
 * @param predicate
 */
export function getElementChildren(
	element: V1Element | null,
	model: V1Model,
	predicate?: ( model: V1Model ) => boolean
): ElementOrModel[] {
	const results: ElementOrModel[] = [];

	// Try container.children first (rendered elements)
	if ( element?.children?.length ) {
		for ( const child of element.children ) {
			if ( ! predicate || predicate( child.model ) ) {
				results.push( { container: child, model: child.model } );
			}
		}

		return results;
	}

	// Fall back to model.get('elements') for unrendered children
	const childModels = ( model.get( 'elements' ) ?? [] ) as V1Model[];

	for ( const childModel of childModels ) {
		if ( ! predicate || predicate( childModel ) ) {
			const childId = childModel.get( 'id' ) as string;
			const extendedWindow = window as unknown as ExtendedWindow;
			const childContainer = extendedWindow.elementor?.getContainer?.( childId ) ?? null;
			results.push( { container: childContainer, model: childModel } );
		}
	}

	return results;
}
