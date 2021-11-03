import { useContext } from 'react';

import { Context } from './table-context';
import { arrayToClassName } from 'elementor-app/utils/utils.js';

export default function TableRow( props ) {
	const context = useContext( Context );

	return (
		<tr className={ arrayToClassName( [ 'e-app-import-export-table__row', props.className ] ) }>
			{ props.children }
		</tr>
	);
}

TableRow.propTypes = {
	children: PropTypes.any.isRequired,
	className: PropTypes.string,
};
