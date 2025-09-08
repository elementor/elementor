import * as React from 'react';
import { useMemo, useState } from 'react';
import { numberPropTypeUtil, stringPropTypeUtil, urlPropTypeUtil } from '@elementor/editor-props';
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
import { type DestinationProp } from './link-control';

type Props = {
	queryOptions: {
		params: Record< string, unknown >;
		url: string;
	};
	allowCustomValues?: boolean;
	minInputLength?: number;
	placeholder?: string;
	onSetValue?: ( value: DestinationProp | null ) => void;
};

type Response = HttpResponse< { value: FlatOption[] | CategorizedOption[] } >;

type FetchOptionsParams = Record< string, unknown > & { term: string };

export const QueryControl = createControl( ( props: Props ) => {
	const { value, setValue } = useBoundProp< DestinationProp >();

	const {
		allowCustomValues = true,
		queryOptions: { url, params = {} },
		placeholder,
		minInputLength = 2,
		onSetValue,
	} = props || {};

	const [ options, setOptions ] = useState< FlatOption[] | CategorizedOption[] >(
		generateFirstLoadedOption( value?.value )
	);

	const onOptionChange = ( newValue: number | null ) => {
		if ( newValue === null ) {
			setValue( null );
			onSetValue?.( null );

			return;
		}

		const valueToSave = {
			$$type: 'query',
			value: {
				id: numberPropTypeUtil.create( newValue ),
				label: stringPropTypeUtil.create( findMatchingOption( options, newValue )?.label || null ),
			},
		};

		setValue( valueToSave );
		onSetValue?.( valueToSave );
	};

	const onTextChange = ( newValue: string | null ) => {
		const newLinkValue = newValue?.trim() || '';
		const valueToSave = newLinkValue ? urlPropTypeUtil.create( newLinkValue ) : null;

		setValue( valueToSave );
		onSetValue?.( valueToSave );
		updateOptions( newValue );
	};

	const updateOptions = ( newValue: string | null ) => {
		setOptions( [] );

		if ( ! newValue || ! url || newValue.length < minInputLength ) {
			return;
		}

		debounceFetch( { ...params, term: newValue } );
	};

	const debounceFetch = useMemo(
		() =>
			debounce(
				( queryParams: FetchOptionsParams ) =>
					fetchOptions( url, queryParams ).then( ( newOptions ) => {
						setOptions( formatOptions( newOptions ) );
					} ),
				400
			),
		[ url ]
	);

	return (
		<ControlActions>
			<Autocomplete
				options={ options }
				allowCustomValues={ allowCustomValues }
				placeholder={ placeholder }
				value={ value?.value?.id?.value || value?.value }
				onOptionChange={ onOptionChange }
				onTextChange={ onTextChange }
				minInputLength={ minInputLength }
			/>
		</ControlActions>
	);
} );

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

function generateFirstLoadedOption( unionValue: DestinationProp | null ): FlatOption[] {
	const value = unionValue?.id?.value;
	const label = unionValue?.label?.value;
	const type = unionValue?.id?.$$type || 'url';

	return value && label && type === 'number'
		? [
				{
					id: value.toString(),
					label,
				},
		  ]
		: [];
}
