import './css-grid.scss';

export default function CssGrid( props ) {
	const gridStyle = {
		'--eps-grid-columns': props.columns,
		'--eps-grid-spacing': props.spacing,
	};

	return (
		<div style={gridStyle} className={`eps-css-grid ${ props.className }`}>
			{ props.children }
		</div>
	);
}

CssGrid.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any.isRequired,
	columns: PropTypes.number,
	spacing: PropTypes.number,
};

CssGrid.defaultProps = {
	columns: 4,
	spacing: 24,
};
