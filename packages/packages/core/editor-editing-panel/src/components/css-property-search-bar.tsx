import * as React from 'react';
import { useCallback, useState } from 'react';
import { SearchIcon } from '@elementor/icons';
import { Autocomplete, Box, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCSSPropertyNavigation } from '../utils/css-property-navigation';
import { type CSSPropertyMapping, searchCSSProperties } from '../utils/css-property-search-map';

type SearchOption = CSSPropertyMapping & {
	id: string;
	label: string;
	group: string;
};

export const CSSPropertySearchBar = () => {
	const [ inputValue, setInputValue ] = useState( '' );
	const [ options, setOptions ] = useState< SearchOption[] >( [] );
	const { navigateToProperty } = useCSSPropertyNavigation();

	const handleInputChange = useCallback( ( _: unknown, value: string ) => {
		setInputValue( value );

		if ( value.length >= 2 ) {
			const results = searchCSSProperties( value ).map( ( mapping ) => ( {
				...mapping,
				id: mapping.property,
				label: mapping.displayName,
				group: mapping.section,
			} ) );
			setOptions( results );
		} else {
			setOptions( [] );
		}
	}, [] );

	const handleOptionSelect = useCallback(
		( _: unknown, value: string | SearchOption | null ) => {
			// Handle both string (free text) and option selection
			if ( value && typeof value === 'object' ) {
				navigateToProperty( value.property );
				setInputValue( '' );
				setOptions( [] );
			}
		},
		[ navigateToProperty ]
	);

	return (
		<Stack p={ 2 }>
			<Autocomplete
				size="tiny"
				freeSolo
				disableClearable={ false }
				forcePopupIcon={ false }
				options={ options }
				inputValue={ inputValue }
				onInputChange={ handleInputChange }
				onChange={ handleOptionSelect }
				getOptionLabel={ ( option ) => ( typeof option === 'string' ? option : option.label ) }
				groupBy={ ( option ) => option.group }
				renderGroup={ ( params ) => (
					<li key={ params.key }>
						<Typography
							variant="caption"
							sx={ {
								px: 1.5,
								py: 0.5,
								fontWeight: 'bold',
								color: 'text.secondary',
								backgroundColor: 'action.hover',
								display: 'block',
							} }
						>
							{ params.group }
						</Typography>
						<ul style={ { padding: 0 } }>{ params.children }</ul>
					</li>
				) }
				renderOption={ ( props, option ) => (
					<Box component="li" { ...props } key={ option.id } sx={ { py: 0.75 } }>
						<Box sx={ { display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 } }>
							<Typography variant="body2" component="div" noWrap>
								{ option.displayName }
							</Typography>
							<Typography variant="caption" color="text.secondary" noWrap>
								{ option.property }
							</Typography>
						</Box>
					</Box>
				) }
				renderInput={ ( params ) => (
					<TextField
						{ ...params }
						placeholder={ __( 'Search CSS properties…', 'elementor' ) }
						variant="outlined"
						InputProps={ {
							...params.InputProps,
							startAdornment: <SearchIcon fontSize="tiny" sx={ { color: 'text.secondary', mr: 0.5 } } />,
							sx: {
								fontSize: 'inherit',
								'& .MuiInputBase-input': {
									fontSize: 'inherit',
								},
							},
						} }
						sx={ {
							'& .MuiOutlinedInput-root': {
								fontSize: 'caption.fontSize',
								minHeight: 'auto',
								'& fieldset': {
									borderColor: 'divider',
								},
								'&:hover fieldset': {
									borderColor: 'primary.main',
								},
								'&.Mui-focused fieldset': {
									borderColor: 'primary.main',
									borderWidth: 1,
								},
							},
						} }
					/>
				) }
			/>
		</Stack>
	);
};
