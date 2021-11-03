import { useContext } from 'react';

import { Context } from './table-context';
import { arrayToClassName } from 'elementor-app/utils/utils.js';

export default function TableCell( props ) {
	const context = useContext( Context );

	const Element = () => React.createElement( props.tag, {
		className: arrayToClassName( [ 'e-app-import-export-table__cell', props.className ] ),
	}, props.children );

	return <Element />;
}

TableCell.propTypes = {
	children: PropTypes.any.isRequired,
	className: PropTypes.string,
	tag: PropTypes.oneOf( [ 'td', 'th' ] ).isRequired,
};
