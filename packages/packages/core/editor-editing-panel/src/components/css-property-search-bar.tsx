import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchIcon } from '@elementor/icons';
import { Autocomplete, Box, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCSSPropertyNavigation } from '../utils/css-property-navigation';
import { type CSSPropertyMapping } from '../utils/css-property-search-map';
import { semanticSearchCSSProperties } from '../utils/semantic-search';

type SearchOption = CSSPropertyMapping & {
	id: string;
	label: string;
	group: string;
};

export const CSSPropertySearchBar = () => {
	const [ inputValue, setInputValue ] = useState( '' );
	const [ options, setOptions ] = useState< SearchOption[] >( [] );
	const { navigateToProperty } = useCSSPropertyNavigation();

	// Track the latest search request to prevent race conditions
	const latestSearchRef = useRef< string >( '' );
	const debounceTimeoutRef = useRef< NodeJS.Timeout | null >( null );

	// Debounced search function
	const debouncedSearch = useCallback( async ( query: string ) => {
		const currentSearch = query;
		latestSearchRef.current = currentSearch;

		try {
			// Use semantic search for intelligent CSS property discovery
			const semanticResults = await semanticSearchCSSProperties( query, 10, 0.2 );

			// Only update options if this is still the latest search
			if ( latestSearchRef.current === currentSearch ) {
				const searchOptions = semanticResults.map( ( mapping: CSSPropertyMapping ) => ( {
					...mapping,
					id: mapping.property,
					label: mapping.displayName,
					group: mapping.section,
				} ) );

				setOptions( searchOptions );
			}
		} catch {
			// Only clear options if this is still the latest search
			if ( latestSearchRef.current === currentSearch ) {
				setOptions( [] );
			}
		}
	}, [] );

	const handleInputChange = ( _: unknown, value: string ) => {
		setInputValue( value );

		// Clear any existing debounce timeout
		if ( debounceTimeoutRef.current ) {
			clearTimeout( debounceTimeoutRef.current );
			debounceTimeoutRef.current = null;
		}

		if ( value.length >= 2 ) {
			// Debounce the search to avoid excessive API calls
			debounceTimeoutRef.current = setTimeout( () => {
				debouncedSearch( value );
			}, 300 ); // 300ms debounce delay
		} else {
			// Clear options immediately when input is too short
			setOptions( [] );
			latestSearchRef.current = value;
		}
	};

	// Cleanup timeout on unmount
	useEffect( () => {
		return () => {
			if ( debounceTimeoutRef.current ) {
				clearTimeout( debounceTimeoutRef.current );
			}
		};
	}, [] );

	const handleOptionSelect = useCallback(
		( _: unknown, value: string | SearchOption | null ) => {
			// Clear any pending debounced search
			if ( debounceTimeoutRef.current ) {
				clearTimeout( debounceTimeoutRef.current );
				debounceTimeoutRef.current = null;
			}

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
				renderOption={ ( props, option ) => {
					return (
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
					);
				} }
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
