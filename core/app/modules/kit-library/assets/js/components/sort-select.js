import { Select, Button } from '@elementor/app-ui';
import { useState, useEffect } from 'react';

import './sort-select.scss';

export default function SortSelect( props ) {
	const findSelectedOption = ( value ) => {
		return props.options.find( ( option ) => option.value === value );
	};

	const [ selectedOption, selectOption ] = useState( findSelectedOption( props.value.by ) );

	useEffect( () => {
		props.onChange( { by: selectedOption.value, direction: selectedOption.defaultOrder ?? props.value.direction } );
	}, [ selectedOption ] );

	return (
		<div className="eps-sort-select">
			<div className="eps-sort-select__select-wrapper">
				<Select
					options={ props.options }
					value={ props.value.by }
					onChange={ ( e ) => {
						const value = e.target.value;
						selectOption( findSelectedOption( value ) );
					} }
					className="eps-sort-select__select"
				/>
			</div>
			{
				! selectedOption.orderDisabled &&
					<Button
						text={ 'asc' === props.value.direction ? __( 'Sort Descending', 'elementor' ) : __( 'Sort Ascending', 'elementor' ) }
						hideText={ true }
						icon={ 'asc' === props.value.direction ? 'eicon-arrow-up' : 'eicon-arrow-down' }
						className="eps-sort-select__button"
						onClick={ () => {
							props.onChange( {
								by: props.value.by,
								direction: 'asc' === props.value.direction ? 'desc' : 'asc',
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
};
