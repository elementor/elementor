export default function BarHeading( props ) {
	return (
		<div className="top-bar-heading-wrapper bar-flex">
			<div className="top-bar-heading-logo">
				<i className="eicon-elementor" aria-hidden="true"></i>
			</div>
			<h1 className="top-bar-heading-title">{ props.children }</h1>
		</div>
	);
}

BarHeading.propTypes = {
	children: PropTypes.any,
};
