import * as React from 'react';
import { type AutocompleteRenderGetTagProps, Chip } from '@elementor/ui';

const MULTISELECT_AUTOCOMPLETE_CHIP_SIZE = 'tiny' as const;

export type MultiselectAutocompleteChipTagsProps< Option > = {
	getLabel: ( option: Option ) => string;
	getTagProps: AutocompleteRenderGetTagProps;
	values: Option[];
};

export function MultiselectAutocompleteChipTags< Option >( {
	getLabel,
	getTagProps,
	values,
}: MultiselectAutocompleteChipTagsProps< Option > ) {
	return (
		<>
			{ values.map( ( option, index ) => {
				const { key, ...tagProps } = getTagProps( { index } );

				return (
					<Chip
						key={ key }
						label={ getLabel( option ) }
						size={ MULTISELECT_AUTOCOMPLETE_CHIP_SIZE }
						{ ...tagProps }
					/>
				);
			} ) }
		</>
	);
}
