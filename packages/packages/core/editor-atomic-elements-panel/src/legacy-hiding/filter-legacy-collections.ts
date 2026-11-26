import { type LegacyCollection, type LegacyCollections, type LegacyModel } from './types';

// The Atomic panel owns the form tiles, so Legacy never shows this category when it ends up empty.
const ATOMIC_FORM_CATEGORY = 'atomic-form';

export function filterLegacyCollections(
	{ elementsCollection, categoriesCollection }: LegacyCollections,
	hiddenTypes: Set< string >
): LegacyCollections {
	const isHidden = ( model: unknown ) => isHiddenElement( model, hiddenTypes );

	const categories = categoriesCollection.models.flatMap( ( model ) => {
		const items = readAttribute( model, 'items' );

		if ( ! Array.isArray( items ) ) {
			return isAtomicFormCategory( model ) ? [] : [ toAttributes( model ) ];
		}

		const keptItems = items.filter( ( item ) => ! isHidden( item ) );
		const shouldDrop = ! keptItems.length && ( keptItems.length < items.length || isAtomicFormCategory( model ) );

		return shouldDrop ? [] : [ { ...toAttributes( model ), items: keptItems } ];
	} );

	return {
		elementsCollection: cloneWith(
			elementsCollection,
			elementsCollection.models.filter( ( model ) => ! isHidden( model ) )
		),
		categoriesCollection: cloneWith( categoriesCollection, categories ),
	};
}

function isHiddenElement( model: unknown, hiddenTypes: Set< string > ) {
	const key = readAttribute( model, 'widgetType' ) || readAttribute( model, 'elType' );
	const custom = readAttribute( model, 'custom' ) as { originalWidget?: unknown } | null | undefined;

	return typeof key === 'string' && hiddenTypes.has( key ) && ! custom?.originalWidget;
}

function isAtomicFormCategory( model: LegacyModel ) {
	return readAttribute( model, 'name' ) === ATOMIC_FORM_CATEGORY;
}

function readAttribute( model: unknown, key: string ): unknown {
	const get = ( model as Partial< LegacyModel > | null | undefined )?.get;

	return typeof get === 'function' ? get.call( model, key ) : undefined;
}

function toAttributes( model: LegacyModel ) {
	return typeof model?.toJSON === 'function' ? model.toJSON() : {};
}

function cloneWith( collection: LegacyCollection, models: unknown[] ) {
	const clone = collection.clone();

	clone.reset( models );

	return clone;
}
