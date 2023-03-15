export default function Select( props ) {
	return (
		<select multiple={ props.multiple } className={ props.className } value={ props.value } onChange={ props.onChange } ref={ props.elRef } onClick={ () => props.onClick?.() }>
			{ props.options.map( ( option ) =>
				option.children
					? <optgroup label={ option.label } key={ option.label }>
						{ option.children.map( ( childOption ) =>
							<option key={ childOption.value } value={ childOption.value }>
								{ childOption.label }
							</option>,
						) }
					</optgroup>
					: <option key={ option.value } value={ option.value }>
						{ option.label }
					</option>,
			) }
		</select>
	);
}
Select.propTypes = {
	className: PropTypes.string,
	onChange: PropTypes.func,
	options: PropTypes.array,
	elRef: PropTypes.object,
	multiple: PropTypes.bool,
	value: PropTypes.oneOfType( [ PropTypes.array, PropTypes.string ] ),
	onClick: PropTypes.func,
};
Select.defaultProps = {
	className: '',
	options: [],
};
