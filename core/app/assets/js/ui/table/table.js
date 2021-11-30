import { useState, useEffect } from 'react';

import { Context } from './table-context';
import { arrayToClassName } from 'elementor-app/utils/utils.js';

import TableHead from './table.head';
import TableBody from './table-body';
import TableRow from './table-row';
import TableCell from './table-cell';
import TableCheckbox from './table-checkbox';

import './table.scss';

export default function Table( props ) {
	const getInitialSelections = () => {
		const initialSelected = {};

		props.initialSelected.forEach( ( value ) => initialSelected[ value ] = value );

		return initialSelected;
	},
	[ selected, setSelected ] = useState( getInitialSelections() ),
	[ disabled, setDisabled ] = useState( props.initialDisabled ),
	classNameBase = 'eps-table',
	classes = [ classNameBase, { [ classNameBase + '--selection' ]: props.hasOwnProperty( 'selection' ) }, props.className ];

	useEffect( () => {
		props.onSelect( Object.values( selected ) );
	}, [ selected ] );

	return (
		<Context.Provider value={ { selected, setSelected, disabled, setDisabled } }>
			<table className={ arrayToClassName( classes ) }>
				{
					props.selection &&
					<colgroup>
						<col className="e-app-import-export-table__checkboxes-column" />
					</colgroup>
				}

				{ props.children }
			</table>
		</Context.Provider>
	);
}

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.Checkbox = TableCheckbox;

Table.propTypes = {
	children: PropTypes.any.isRequired,
	className: PropTypes.string,
	headers: PropTypes.array,
	initialDisabled: PropTypes.array,
	initialSelected: PropTypes.array,
	rows: PropTypes.array,
	selection: PropTypes.bool,
	onSelect: PropTypes.func,
};

Table.defaultProps = {
	selection: false,
	initialDisabled: [],
	initialSelected: [],
};
