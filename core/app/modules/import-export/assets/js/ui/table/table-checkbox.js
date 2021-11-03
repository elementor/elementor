import { useContext, useEffect } from 'react';

import { Context } from './table-context';
import { arrayToClassName } from 'elementor-app/utils/utils.js';

import Checkbox from 'elementor-app/ui/atoms/checkbox';

export default function TableCheckbox( props ) {
	const context = useContext( Context ),
		isAllSelected = () => Object.keys( context.selected ).length === props.total,
		getIsSelected = () => props.total ? isAllSelected() : ( props.index in context.selected ),
		onSelectAll = () => {
			context.setSelected( () => {
				if ( isAllSelected() ) {
					return {};
				}

				const allItems = {};

				Array( props.total )
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
		onChange = () => props.total ? onSelectAll() : onSelectRow();

	return (
		<Checkbox
			className={ arrayToClassName( [ 'e-app-import-export-table__checkbox', props.className ] ) }
			checked={ getIsSelected() }
			onChange={ onChange }
		/>
	);
}

TableCheckbox.propTypes = {
	className: PropTypes.string,
	index: PropTypes.number,
	total: PropTypes.number,
};
