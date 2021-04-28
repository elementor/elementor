import Select from 'elementor-app/ui/atoms/select';
import Button from 'elementor-app/ui/molecules/button';

import './sort-select.scss';

export default function SortSelect( props ) {
	return (
		<div className="eps-sort-select">
			<div className="eps-sort-select__select-wrapper">
				<Select
					options={ props.options }
					value={ props.value.by }
					onChange={ ( e ) => {
						const value = e.target.value;

						props.onChange( ( prev ) => ( { ...prev, by: value } ) );
					} }
					className="eps-sort-select__select"
				/>
			</div>
			<Button
				text={ 'asc' === props.value.direction ? __( 'Sort Descending', 'elementor' ) : __( 'Sort Ascending', 'elementor' ) }
				hideText={ true }
				icon={ 'asc' === props.value.direction ? 'eicon-arrow-up' : 'eicon-arrow-down' }
				className="eps-sort-select__button"
				onClick={ () => {
					props.onChange( ( prev ) => ( {
						...prev,
						direction: 'asc' === prev.direction ? 'desc' : 'asc',
					} ) );
				} }
			/>
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
