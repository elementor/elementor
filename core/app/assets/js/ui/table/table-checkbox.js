import { useContext, useEffect } from 'react';

import { Context } from './table-context';
import { arrayToClassName } from 'elementor-app/utils/utils.js';

import Checkbox from 'elementor-app/ui/atoms/checkbox';

export default function TableCheckbox( props ) {
	const context = useContext( Context ),
		attrs = { ...props },
		isSelectAllCheckbox = () => props.hasOwnProperty( 'allSelectedCount' ),
		isAllSelected = () => Object.keys( context.selected ).length === props.allSelectedCount,
		isIndeterminate = () => isSelectAllCheckbox() ? ! ! ( Object.keys( context.selected ).length && ! isAllSelected() ) : false,
		getIsSelected = () => isSelectAllCheckbox() ? isAllSelected() : ( props.index in context.selected ),
		getIsDisabled = () => ! isSelectAllCheckbox() ? context.disabled.includes( props.index ) : null,
		onSelectAll = () => {
			context.setSelected( () => {
				if ( isAllSelected() || isIndeterminate() ) {
					return {};
				}

				const allItems = {};

				Array( props.allSelectedCount )
					.fill( true )
					.map( ( value, index ) => allItems[ index ] = index );

				return allItems;
			} );
		},
		onSelectRow = () => {
			context.setSelected( ( prevState ) => {
				const currentSelections = { ...prevState };

				if ( props.index in currentSelections ) {
					delete currentSelections[ props.index ];
				} else {
					currentSelections[ props.index ] = props.index;
				}

				return currentSelections;
			} );
		},
		onChange = () => isSelectAllCheckbox() ? onSelectAll() : onSelectRow();

	// Removing non-native attributes before passing it to the Checkbox component.
	delete attrs.allSelectedCount;

	return (
		<Checkbox
			checked={ getIsSelected() }
			indeterminate={ isIndeterminate() }
			onChange={ onChange }
			disabled={ getIsDisabled() }
			{ ...attrs }
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
