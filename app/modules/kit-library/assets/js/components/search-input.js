import useDebouncedCallback from '../hooks/use-debounced-callback';
import { Icon, Button } from '@elementor/app-ui';
import { useState, useEffect } from 'react';

import './search-input.scss';

export default function SearchInput( props ) {
	const [ localValue, setLocalValue ] = useState( props.value || '' );
	const debouncedOnChange = useDebouncedCallback( ( value ) => props.onChange( value ), props.debounceTimeout );

	useEffect( () => {
		if ( props.value !== localValue ) {
			setLocalValue( props.value );
		}
	}, [ props.value ] );

	return (
		<div className={ `eps-search-input__container ${ props.className }` }>
			<input
				className={ `eps-search-input eps-search-input--${ props.size }` }
				placeholder={ props.placeholder }
				value={ localValue }
				onChange={ ( e ) => {
					setLocalValue( e.target.value );
					debouncedOnChange( e.target.value );
				} }
			/>
			<Icon className={ `eicon-search-bold eps-search-input__icon eps-search-input__icon--${ props.size }` } />
			{
				props.value &&
				<Button
					text={ __( 'Clear', 'elementor' ) }
					hideText={ true }
					className={ `eicon-close-circle eps-search-input__clear-icon eps-search-input__clear-icon--${ props.size }` }
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
	className: PropTypes.string,
	size: PropTypes.oneOf( [ 'md', 'sm' ] ),
	debounceTimeout: PropTypes.number,
};

SearchInput.defaultProps = {
	className: '',
	size: 'md',
	debounceTimeout: 300,
};
