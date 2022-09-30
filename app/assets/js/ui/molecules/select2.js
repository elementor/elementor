import Select from '../atoms/select';

import './select2.scss';

/**
 * Default settings of the select 2
 *
 * @return {{placeholder: string, allowClear: boolean, dir: string}}
 */

const getDefaultSettings = () => ( {
	allowClear: true,
	placeholder: '',
	dir: elementorCommon.config.isRTL ? 'rtl' : 'ltr',
} );
/**
 * Main component
 *
 * @param {*} props
 * @return {*} component
 * @function Object() { [native code] }
 */
export default function Select2( props ) {
	const ref = React.useRef( null );

	// Initiate the select 2 library, call to onReady after initiate, and
	// listen to select event on the select instance.
	React.useEffect( () => {
		const $select2 = jQuery( ref.current )
			.select2( {
				...getDefaultSettings(),
				...props.settings,
				placeholder: props.placeholder,
			} )
			.on( 'select2:select select2:unselect', props.onChange );

		if ( props.onReady ) {
			props.onReady( $select2 );
		}

		return () => {
			$select2.select2( 'destroy' ).off( 'select2:select select2:unselect' );
		};
	}, [ props.settings, props.options ] );

	// Listen to changes in the prop `value`, if changed update the select 2.
	React.useEffect( () => {
		jQuery( ref.current ).val( props.value ).trigger( 'change' );
	}, [ props.value ] );

	return <Select
		multiple={ props.multiple }
		value={ props.value }
		onChange={ props.onChange }
		elRef={ ref }
		options={ props.options }
		placeholder={ props.placeholder }
	/>;
}
Select2.propTypes = {
	value: PropTypes.oneOfType( [ PropTypes.array, PropTypes.string ] ),
	onChange: PropTypes.func,
	onReady: PropTypes.func,
	options: PropTypes.array,
	settings: PropTypes.object,
	multiple: PropTypes.bool,
	placeholder: PropTypes.string,
};
Select2.defaultProps = {
	settings: {},
	options: [],
	dependencies: [],
	placeholder: '',
};
