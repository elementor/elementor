import * as React from 'react';
import { useMemo, useState } from 'react';
import { type LinkPropValue, numberPropTypeUtil, queryPropTypeUtil, stringPropTypeUtil } from '@elementor/editor-props';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { debounce } from '@elementor/utils';

import { useBoundProp } from '../bound-prop-context';
import {
	Autocomplete,
	type CategorizedOption,
	findMatchingOption,
	type FlatOption,
	isCategorizedOptionPool,
} from '../components/autocomplete';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

type Props = {
	queryOptions: {
		requestParams: Record< string, unknown >;
		endpoint: string;
	};
	allowCustomValues?: boolean;
	minInputLength?: number;
	placeholder?: string;
	externalValue?: string | number | null;
	setExternalValue?: ( value: string | null ) => void;
};

type Response = HttpResponse< { value: FlatOption[] | CategorizedOption[] } >;

export const QueryControl = createControl( ( props: Props ) => {
	const { value, setValue } = useBoundProp( queryPropTypeUtil );

	const {
		allowCustomValues = false,
		queryOptions: { endpoint = '', requestParams = {} },
		placeholder,
		minInputLength = 2,
		externalValue = null,
		setExternalValue,
	} = props || {};

	const [ options, setOptions ] = useState< FlatOption[] | CategorizedOption[] >(
		generateFirstLoadedOption( value )
	);

	const onOptionChange = ( newValue: number | null ) => {
		setValue( {
			...value,
			id: numberPropTypeUtil.create( newValue ),
			label: stringPropTypeUtil.create( findMatchingOption( options, newValue )?.label || null ),
		} );
	};

	const onTextChange = ( newValue: string | null ) => {
		setValue( null );
		setExternalValue?.( newValue?.trim() || '' );
		updateOptions( newValue );
	};

	const updateOptions = ( newValue: string | null ) => {
		setOptions( [] );

		if ( ! newValue || ! endpoint || newValue.length < minInputLength ) {
			return;
		}

		debounceFetch( { ...requestParams, term: newValue } );
	};

	const debounceFetch = useMemo(
		() =>
			debounce(
				( params: FetchOptionsParams ) =>
					fetchOptions( endpoint, params ).then( ( newOptions ) => {
						setOptions( formatOptions( newOptions ) );
					} ),
				400
			),
		[ endpoint ]
	);

	return (
		<ControlActions>
			<Autocomplete
				options={ options }
				allowCustomValues={ allowCustomValues }
				placeholder={ placeholder }
				value={ value?.label?.value || value?.id?.value || externalValue }
				onOptionChange={ onOptionChange }
				onTextChange={ onTextChange }
				minInputLength={ minInputLength }
			/>
		</ControlActions>
	);
} );

type FetchOptionsParams = Record< string, unknown > & { term: string };

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

function generateFirstLoadedOption( unionValue: LinkPropValue[ 'value' ] | null ): FlatOption[] {
	const value = unionValue?.destination?.value;
	const label = unionValue?.label?.value;
	const type = unionValue?.destination?.$$type || 'url';

	return value && label && type === 'number'
		? [
				{
					id: value.toString(),
					label,
				},
		  ]
		: [];
}
