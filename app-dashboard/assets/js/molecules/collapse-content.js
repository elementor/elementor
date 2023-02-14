export default function CollapseContent( props ) {
	return (
		<div className="e-app-collapse-content">
			{ props.children }
		</div>
	);
}

CollapseContent.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
};

CollapseContent.defaultProps = {
	className: '',
};
