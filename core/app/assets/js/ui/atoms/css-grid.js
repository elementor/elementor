import { pxToRem } from '../../utils/utils';

import './css-grid.scss';

export default function CssGrid( props ) {
	const gridStyle = {
		'--eps-grid-columns': props.columns,
		'--eps-grid-spacing': pxToRem( props.spacing ),
		'--eps-grid-col-min-width': pxToRem( props.colMinWidth ),
		'--eps-grid-col-max-width': pxToRem( props.colMaxWidth ),
	};

	return (
		<div style={ gridStyle } className={ `eps-css-grid ${ props.className }` }>
			{ props.children }
		</div>
	);
}

CssGrid.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any.isRequired,
	columns: PropTypes.number,
	spacing: PropTypes.number,
	colMinWidth: PropTypes.number,
	colMaxWidth: PropTypes.number,
};

CssGrid.defaultProps = {
	spacing: 24,
	className: '',
};
