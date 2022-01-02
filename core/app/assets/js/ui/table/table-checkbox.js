import { useContext } from 'react';

import { Context } from './table-context';
import { arrayToClassName } from 'elementor-app/utils/utils.js';

import Checkbox from 'elementor-app/ui/atoms/checkbox';

export default function TableCheckbox( props ) {
	const context = useContext( Context ),
		isSelectAllCheckbox = props.hasOwnProperty( 'allSelectedCount' ),
		isAllSelected = context.selected.length === props.allSelectedCount,
		isIndeterminate = isSelectAllCheckbox ? ! ! ( context.selected.length && ! isAllSelected ) : false,
		isSelected = isSelectAllCheckbox ? isAllSelected : context.selected.includes( props.index ),
		isDisabled = ! isSelectAllCheckbox ? context.disabled.includes( props.index ) : null,
		onSelectAll = () => {
			context.setSelected( () => {
				if ( isAllSelected || isIndeterminate ) {
					return [];
				}

				return Array( props.allSelectedCount )
					.fill( true )
					.map( ( value, index ) => index );
			} );
		},
		onSelectRow = () => {
			context.setSelected( ( prevState ) => {
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
