export type MarkedModel = {
	widget?: unknown;
	part?: unknown;
	slot?: unknown;
	isLocked?: boolean;
	elements?: MarkedModel[];
};

export function stripOrphanMarkers< TModel extends MarkedModel >( model: TModel ): TModel {
	if ( model.widget ) {
		return model;
	}

	const elements = model.elements?.map( stripOrphanMarkers );
	const hasChangedChildren = elements?.some( ( element, index ) => element !== model.elements?.[ index ] ) ?? false;
	const hasMarkers = undefined !== model.part || undefined !== model.slot;

	if ( ! hasMarkers && ! hasChangedChildren ) {
		return model;
	}

	const { part, slot: _slot, isLocked, ...rest } = model;
	const keepsLock = undefined === part && undefined !== isLocked;

	return {
		...rest,
		...( keepsLock && { isLocked } ),
		...( elements && { elements } ),
	} as TModel;
}
