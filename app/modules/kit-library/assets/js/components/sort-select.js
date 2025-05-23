import { Select, Button } from '@elementor/app-ui';
import { useState, useEffect } from 'react';

import './sort-select.scss';

export default function SortSelect( props ) {
	const getSelectedOptionDetails = ( value ) => {
		return props.options.find( ( option ) => option.value === value );
	};

	const [ selectedSortBy, setSelectedSortBy ] = useState( getSelectedOptionDetails( props.value.by ) );

	useEffect( () => {
		props.onChange( { by: selectedSortBy.value, direction: selectedSortBy.defaultOrder ?? props.value.direction } );
	}, [ selectedSortBy ] );

	return (
		<div className="eps-sort-select">
			<div className="eps-sort-select__select-wrapper">
				<Select
					options={ props.options }
					value={ props.value.by }
					onChange={ ( e ) => {
						const value = e.target.value;
						setSelectedSortBy( getSelectedOptionDetails( value ) );
						props.onChangeSortValue?.( value );
					} }
					className="eps-sort-select__select"
					onClick={ () => {
						props.onChange( {
							by: props.value.by,
							direction: props.value.direction,
						} );
						props.onSortSelectOpen?.();
					} }
				/>
			</div>
			{
				! selectedSortBy.orderDisabled &&
					<Button
						text={ 'asc' === props.value.direction ? __( 'Sort Descending', 'elementor' ) : __( 'Sort Ascending', 'elementor' ) }
						hideText={ true }
						icon={ 'asc' === props.value.direction ? 'eicon-arrow-up' : 'eicon-arrow-down' }
						className="eps-sort-select__button"
						onClick={ () => {
							const direction = props.value.direction && 'asc' === props.value.direction ? 'desc' : 'asc';
							if ( props.onChangeSortDirection ) {
								props.onChangeSortDirection( direction );
							}
							props.onChange( {
								by: props.value.by,
								direction,
							} );
						} }
					/>
			}
		</div>
	);
}

SortSelect.propTypes = {
	options: PropTypes.arrayOf( PropTypes.shape( {
		label: PropTypes.string.isRequired,
		value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
	} ) ).isRequired,
	value: PropTypes.shape( {
		direction: PropTypes.oneOf( [ 'asc', 'desc' ] ).isRequired,
		by: PropTypes.string.isRequired,
	} ).isRequired,
	onChange: PropTypes.func.isRequired,
	onChangeSortValue: PropTypes.func,
	onSortSelectOpen: PropTypes.func,
	onChangeSortDirection: PropTypes.func,
};
