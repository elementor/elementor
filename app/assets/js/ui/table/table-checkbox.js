import { useContext } from 'react';

import { Context } from './table-context';
import { arrayToClassName } from 'elementor-app/utils/utils.js';

import Checkbox from 'elementor-app/ui/atoms/checkbox';

export default function TableCheckbox( props ) {
	const context = useContext( Context ),
		{ selected, disabled, setSelected } = context || {},
		isSelectAllCheckbox = Object.prototype.hasOwnProperty.call( props, 'allSelectedCount' ),
		isAllSelected = selected.length === props.allSelectedCount,
		isIndeterminate = isSelectAllCheckbox ? ! ! ( ( selected.length - disabled.length ) && ! isAllSelected ) : false,
		isSelected = isSelectAllCheckbox ? isAllSelected : selected.includes( props.index ),
		isDisabled = ! isSelectAllCheckbox ? disabled.includes( props.index ) : null,
		onSelectAll = () => {
			setSelected( () => {
				if ( isAllSelected || isIndeterminate ) {
					// Disabled checkboxes should not be unchecked.
					return disabled.length ? [ ...disabled ] : [];
				}

				return Array( props.allSelectedCount )
					.fill( true )
					.map( ( value, index ) => index );
			} );
		},
		onSelectRow = () => {
			setSelected( ( prevState ) => {
				const currentSelections = [ ...prevState ],
					currentIndexPosition = currentSelections.indexOf( props.index );

				if ( currentIndexPosition > -1 ) {
					currentSelections.splice( currentIndexPosition, 1 );
				} else {
					currentSelections.push( props.index );
				}

				return currentSelections;
			} );
		},
		onChange = () => isSelectAllCheckbox ? onSelectAll() : onSelectRow();

	return (
		<Checkbox
			checked={ isSelected }
			indeterminate={ isIndeterminate }
			onChange={ onChange }
			disabled={ isDisabled }
			className={ arrayToClassName( [ 'eps-table__checkbox', props.className ] ) }
		/>
	);
}

TableCheckbox.propTypes = {
	className: PropTypes.string,
	index: PropTypes.number,
	initialChecked: PropTypes.bool,
	allSelectedCount: PropTypes.number,
};
