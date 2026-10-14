import * as React from 'react';
import { numberPropTypeUtil, queryPropTypeUtil, stringPropTypeUtil, urlPropTypeUtil } from '@elementor/editor-props';
import { SearchIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { useBoundProp } from '../bound-prop-context';
import { Autocomplete, findMatchingOption } from '../components/autocomplete';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { useQueryAutocomplete } from '../hooks/use-query-autocomplete';
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
	ariaLabel?: string;
};

export const QueryControl = createControl( ( props: Props ) => {
	const { value: queryValue, setValue: setQueryValue } = useBoundProp( queryPropTypeUtil );
	const { value: urlValue, setValue: setUrlValue, placeholder: urlPlaceholder } = useBoundProp( urlPropTypeUtil );

	const {
		allowCustomValues = true,
		queryOptions: { url, params = {} },
		placeholder = __( 'Search', 'elementor' ),
		minInputLength = 2,
		onSetValue,
		ariaLabel,
	} = props || {};

	const { options, updateOptions } = useQueryAutocomplete( {
		url,
		params,
		minInputLength,
		initialQueryValue: queryValue,
	} );

	const onOptionChange = ( newValue: number | null ) => {
		if ( newValue === null ) {
			setQueryValue( null );
			onSetValue?.( null );

			return;
		}

		const newQueryValue = {
			id: numberPropTypeUtil.create( newValue ),
			label: stringPropTypeUtil.create( findMatchingOption( options, newValue )?.label || null ),
		};

		setQueryValue( newQueryValue );
		onSetValue?.( queryPropTypeUtil.create( newQueryValue ) );
	};

	const onTextChange = ( newValue: string | null ) => {
		const trimmedValue = newValue?.trim() || '';

		if ( ! trimmedValue ) {
			setUrlValue( null );
			onSetValue?.( null );

			return;
		}

		setUrlValue( trimmedValue );
		onSetValue?.( urlPropTypeUtil.create( trimmedValue ) );
		updateOptions( newValue );
	};

	const displayValue = queryValue?.id?.value ?? urlValue;

	return (
		<ControlActions>
			<Autocomplete
				options={ options }
				allowCustomValues={ allowCustomValues }
				placeholder={ urlPlaceholder ?? placeholder }
				startAdornment={ <SearchIcon fontSize="tiny" /> }
				value={ displayValue }
				onOptionChange={ onOptionChange }
				onTextChange={ onTextChange }
				minInputLength={ minInputLength }
				disablePortal={ false }
				inputProps={ {
					...( ariaLabel ? { 'aria-label': ariaLabel } : {} ),
				} }
			/>
		</ControlActions>
	);
} );
