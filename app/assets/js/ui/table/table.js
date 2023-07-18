import { useState, useEffect } from 'react';

import { Context } from './table-context';
import { arrayToClassName } from 'elementor-app/utils/utils.js';

import TableHead from './table.head';
import TableBody from './table-body';
import TableRow from './table-row';
import TableCell from './table-cell';
import TableCheckbox from './table-checkbox';

import './table.scss';

export default function Table( { className, initialSelected, initialDisabled, selection, children, onSelect } ) {
	const [ selected, setSelected ] = useState( initialSelected ),
	[ disabled, setDisabled ] = useState( initialDisabled ),
	classNameBase = 'eps-table',
	classes = [ classNameBase, { [ classNameBase + '--selection' ]: selection }, className ];

	useEffect( () => {
		if ( onSelect ) {
			onSelect( selected );
		}
	}, [ selected ] );

	return (
		<Context.Provider value={ { selected, setSelected, disabled, setDisabled } }>
			<table className={ arrayToClassName( classes ) }>
				{
					selection &&
					<colgroup>
						<col className={ classNameBase + '__checkboxes-column' } />
					</colgroup>
				}

				{ children }
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
