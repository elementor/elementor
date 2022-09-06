import { arrayToClassName } from 'elementor-app/utils/utils.js';

export default function TableRow( props ) {
	return (
		<tr className={ arrayToClassName( [ 'eps-table__row', props.className ] ) }>
			{ props.children }
		</tr>
	);
}

TableRow.propTypes = {
	children: PropTypes.any.isRequired,
	className: PropTypes.string,
};
