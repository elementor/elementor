import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchIcon } from '@elementor/icons';
import { Autocomplete, Box, Stack, TextField, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCSSPropertyNavigation } from '../utils/css-property-navigation';
import { type CSSPropertyMapping } from '../utils/css-property-search-map';
import { hybridCSSPropertySearch } from '../utils/hybrid-css-search';

type SearchOption = CSSPropertyMapping & {
	id: string;
	label: string;
	group: string;
};

export const CSSPropertySearchBar = () => {
	const [ inputValue, setInputValue ] = useState( '' );
	const [ options, setOptions ] = useState< SearchOption[] >( [] );
	const [ disableFiltering, setDisableFiltering ] = useState( false );
	const [ searchType, setSearchType ] = useState< 'traditional' | 'fuzzy' | 'semantic' >( 'traditional' );
	const { navigateToProperty } = useCSSPropertyNavigation();

	// Track the latest search request to prevent race conditions
	const latestSearchRef = useRef< string >( '' );
	const debounceTimeoutRef = useRef< NodeJS.Timeout | null >( null );

	// Initialize with empty options - only show results when user types

	// Debounced search function using hybrid search strategy
	const debouncedSearch = useCallback( async ( query: string ) => {
		const currentSearch = query;
		latestSearchRef.current = currentSearch;

		try {
			// Use hybrid search: Traditional → Fuzzy → Semantic
			const {
				results,
				searchType: resultType,
				disableFiltering: shouldDisableFiltering,
			} = await hybridCSSPropertySearch( query );

			// Only update if this is still the latest search
			if ( latestSearchRef.current === currentSearch ) {
				const searchOptions = results.map( ( mapping: CSSPropertyMapping ) => ( {
					...mapping,
					id: mapping.property,
					label: mapping.displayName,
					group: mapping.section,
				} ) );

				setOptions( searchOptions );
				setDisableFiltering( shouldDisableFiltering );
				setSearchType( resultType );
			}
		} catch {
			// Only clear options if this is still the latest search
			if ( latestSearchRef.current === currentSearch ) {
				setOptions( [] );
				setDisableFiltering( false );
				setSearchType( 'traditional' );
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

		if ( value.length === 0 ) {
			// Clear options when input is empty - no suggestions until user types
			setOptions( [] );
			setDisableFiltering( false );
			setSearchType( 'traditional' );
			latestSearchRef.current = value;
		} else if ( value.length >= 1 ) {
			// Start searching immediately for any input
			debounceTimeoutRef.current = setTimeout( () => {
				debouncedSearch( value );
			}, 300 ); // 300ms debounce delay
		} else {
			// Clear options for very short input
			setOptions( [] );
			setDisableFiltering( false );
			setSearchType( 'traditional' );
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
				onInputChange={ ( e, value ) => {
					handleInputChange( e, value );
				} }
				filterOptions={ disableFiltering ? ( x ) => x : undefined }
				// Force open when we have options
				open={ options.length > 0 ? true : undefined }
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
						placeholder={ __( 'Search CSS properties or describe styling…', 'elementor' ) }
						variant="outlined"
						InputProps={ {
							...params.InputProps,
							startAdornment: (
								<Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
									<SearchIcon fontSize="tiny" sx={ { color: 'text.secondary' } } />
									{ searchType === 'semantic' && inputValue.length >= 2 && (
										<Box
											sx={ {
												fontSize: '10px',
												color: 'primary.main',
												fontWeight: 'bold',
												opacity: 0.7,
											} }
											title="Using AI semantic search"
										>
											AI
										</Box>
									) }
								</Box>
							),
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
