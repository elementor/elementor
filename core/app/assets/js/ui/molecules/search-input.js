import Icon from '../atoms/icon';

import './search-input.scss';

export default function SearchInput( props ) {
	return (
		<div className="eps-search-input__container">
			<input
				className="eps-search-input"
				placeholder={ props.placeholder }
				value={ props.value || '' }
				onChange={ ( e ) => props.onChange( e.target.value ) }
			/>
			<Icon className="eicon-search-bold eps-search-input__icon"/>
		</div>
	);
}

SearchInput.propTypes = {
	placeholder: PropTypes.string,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
};
