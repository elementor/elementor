import type * as React from 'react';

export function renderSectionItems< T >( {
	items,
	renderItem,
}: {
	items?: T[];
	renderItem: ( item: T ) => React.ReactNode | null;
} ): React.ReactNode[] {
	if ( ! items?.length ) {
		return [];
	}

	return items.flatMap( ( item ) => {
		const rendered = renderItem( item );

		return rendered != null ? [ rendered ] : [];
	} );
}
