import Icon from '../atoms/icon';
import Button from './button';

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
			{
				props.value &&
				<Button
					text={ __( 'Clear', 'elementor' ) }
					hideText={ true }
					className="eicon-close-circle eps-search-input__clear-icon"
					onClick={ () => props.onChange( '' ) }
				/>
			}
		</div>
	);
}

SearchInput.propTypes = {
	placeholder: PropTypes.string,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
};
