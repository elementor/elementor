import * as React from 'react';
import { type AutocompleteRenderGetTagProps, Chip } from '@elementor/ui';

const CHIP_SIZE = 'tiny' as const;

export type ChipsListProps< Option > = {
	getLabel: ( option: Option ) => string;
	getTagProps: AutocompleteRenderGetTagProps;
	values: Option[];
};

export function ChipsList< Option >( { getLabel, getTagProps, values }: ChipsListProps< Option > ) {
	return (
		<>
			{ values.map( ( option, index ) => {
				const { key, ...tagProps } = getTagProps( { index } );

				return <Chip key={ key } label={ getLabel( option ) } size={ CHIP_SIZE } { ...tagProps } />;
			} ) }
		</>
	);
}
