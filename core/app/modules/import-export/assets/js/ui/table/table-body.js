import { useContext } from 'react';

import { Context } from './table-context';
import { arrayToClassName } from 'elementor-app/utils/utils.js';

export default function TableBody( props ) {
	const context = useContext( Context );

	return (
		<tbody className={ arrayToClassName( [ 'e-app-import-export-table__body', props.className ] ) }>
			{ props.children }
		</tbody>
	);
}

TableBody.propTypes = {
	children: PropTypes.any.isRequired,
	className: PropTypes.string,
};
