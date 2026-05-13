import { useMemo, useState } from 'react';
import { numberPropTypeUtil, type QueryPropValue, stringPropTypeUtil } from '@elementor/editor-props';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { debounce } from '@elementor/utils';

import { type CategorizedOption, type FlatOption, isCategorizedOptionPool } from '../components/autocomplete';

type Response = HttpResponse< { value: FlatOption[] | CategorizedOption[] } >;

type FetchOptionsParams = Record< string, unknown > & { term: string };

type UseQueryAutocompleteOptions = {
	url: string;
	params?: Record< string, unknown >;
	minInputLength?: number;
	initialQueryValue?: QueryPropValue[ 'value' ] | null;
	excludeIds?: number[];
};

export type UseQueryAutocompleteResult = {
	options: FlatOption[] | CategorizedOption[];
	updateOptions: ( term: string | null ) => void;
};

export function useQueryAutocomplete( {
	url,
	params = {},
	minInputLength = 2,
	initialQueryValue = null,
	excludeIds,
}: UseQueryAutocompleteOptions ): UseQueryAutocompleteResult {
	const excludeIdSet = useMemo( () => new Set( ( excludeIds ?? [] ).map( String ) ), [ excludeIds ] );

	const [ options, setOptions ] = useState< FlatOption[] | CategorizedOption[] >(
		generateFirstLoadedOption( initialQueryValue )
	);

	const debounceFetch = useMemo(
		() =>
			debounce(
				( queryParams: FetchOptionsParams ) =>
					fetchOptions( url, queryParams ).then( ( newOptions ) => {
						setOptions( formatOptions( filterExcludedOptions( newOptions, excludeIdSet ) ) );
					} ),
				400
			),
		[ url, excludeIdSet ]
	);

	const updateOptions = ( term: string | null ) => {
		setOptions( [] );

		if ( ! term || ! url || term.length < minInputLength ) {
			return;
		}

		debounceFetch( { ...params, term } );
	};

	return { options, updateOptions };
}

async function fetchOptions( ajaxUrl: string, params: FetchOptionsParams ) {
	if ( ! params || ! ajaxUrl ) {
		return [];
	}

	try {
		const { data: response } = await httpService().get< Response >( ajaxUrl, { params } );

		return response.data.value;
	} catch {
		return [];
	}
}

function formatOptions( options: FlatOption[] | CategorizedOption[] ): FlatOption[] | CategorizedOption[] {
	const compareKey = isCategorizedOptionPool( options ) ? 'groupLabel' : 'label';

	return options.sort( ( a, b ) =>
		a[ compareKey ] && b[ compareKey ] ? a[ compareKey ].localeCompare( b[ compareKey ] ) : 0
	);
}

function filterExcludedOptions(
	options: FlatOption[] | CategorizedOption[],
	excludeIdSet: Set< string >
): FlatOption[] | CategorizedOption[] {
	if ( excludeIdSet.size === 0 ) {
		return options;
	}

	return options.filter( ( option ) => ! excludeIdSet.has( String( option.id ) ) ) as
		| FlatOption[]
		| CategorizedOption[];
}

export function extractFlatOptionFromQueryValue(
	queryValue: QueryPropValue[ 'value' ] | null | undefined
): FlatOption | null {
	const id = numberPropTypeUtil.extract( queryValue?.id );
	const label = stringPropTypeUtil.extract( queryValue?.label );

	if ( id === null ) {
		return null;
	}

	return {
		id: String( id ),
		label: label || String( id ),
	};
}

function generateFirstLoadedOption( queryValue: QueryPropValue[ 'value' ] | null ): FlatOption[] {
	const option = extractFlatOptionFromQueryValue( queryValue );

	return option ? [ option ] : [];
}
