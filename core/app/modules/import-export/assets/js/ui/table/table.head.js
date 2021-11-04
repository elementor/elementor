import { arrayToClassName } from 'elementor-app/utils/utils.js';

export default function TableHead( props ) {
	return (
		<thead className={ arrayToClassName( [ 'e-app-import-export-table__head', props.className ] ) }>
			{ props.children }
		</thead>
	);
}

TableHead.propTypes = {
	children: PropTypes.any.isRequired,
	className: PropTypes.string,
};
