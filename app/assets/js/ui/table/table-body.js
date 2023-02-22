import { arrayToClassName } from 'elementor-app/utils/utils.js';

export default function TableBody( props ) {
	return (
		<tbody className={ arrayToClassName( [ 'eps-table__body', props.className ] ) }>
			{ props.children }
		</tbody>
	);
}

TableBody.propTypes = {
	children: PropTypes.any.isRequired,
	className: PropTypes.string,
};
