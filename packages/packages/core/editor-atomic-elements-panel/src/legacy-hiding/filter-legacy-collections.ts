import { type LegacyCollection, type LegacyCollections, type LegacyModel } from './types';

// The Atomic panel owns the form tiles, so Legacy never shows this category when it ends up empty.
const ATOMIC_FORM_CATEGORY = 'atomic-form';

export function filterLegacyCollections(
	{ elementsCollection, categoriesCollection }: LegacyCollections,
	hiddenTypes: Set< string >
): LegacyCollections {
	const isHidden = ( model: unknown ) => isHiddenElement( model, hiddenTypes );

	const categories = categoriesCollection.models.flatMap( ( model ): unknown[] => {
		// Not something we can read or copy, so leave it to Legacy exactly as it came.
		if ( ! isModel( model ) ) {
			return [ model ];
		}

		const items = model.get( 'items' );

		if ( ! Array.isArray( items ) ) {
			return isAtomicFormCategory( model ) ? [] : [ model.toJSON() ];
		}

		const keptItems = items.filter( ( item ) => ! isHidden( item ) );
		const shouldDrop = ! keptItems.length && ( keptItems.length < items.length || isAtomicFormCategory( model ) );

		return shouldDrop ? [] : [ { ...model.toJSON(), items: keptItems } ];
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
	return model.get( 'name' ) === ATOMIC_FORM_CATEGORY;
}

function isModel( model: unknown ): model is LegacyModel {
	const candidate = model as Partial< LegacyModel > | null | undefined;

	return typeof candidate?.get === 'function' && typeof candidate?.toJSON === 'function';
}

function readAttribute( model: unknown, key: string ): unknown {
	const get = ( model as Partial< LegacyModel > | null | undefined )?.get;

	return typeof get === 'function' ? get.call( model, key ) : undefined;
}

function cloneWith( collection: LegacyCollection, models: unknown[] ) {
	const clone = collection.clone();

	clone.reset( models );

	return clone;
}
