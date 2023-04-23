import { arrayToClassName } from 'elementor-app/utils/utils.js';

export default function TableCell( props ) {
	const Element = () => React.createElement( props.tag, {
		className: arrayToClassName( [ 'eps-table__cell', props.className ] ),
		colSpan: props.colSpan || null,
	}, props.children );

	return <Element />;
}

TableCell.propTypes = {
	children: PropTypes.any,
	className: PropTypes.string,
	colSpan: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
	tag: PropTypes.oneOf( [ 'td', 'th' ] ).isRequired,
};
