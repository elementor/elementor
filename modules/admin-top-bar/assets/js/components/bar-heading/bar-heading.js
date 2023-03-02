export default function BarHeading( props ) {
	return (
		<div className="e-admin-top-bar__heading">
			<div className="e-logo-wrapper">
				<i className="eicon-elementor" aria-hidden="true"></i>
			</div>
			<span className="e-admin-top-bar__heading-title">{ props.children }</span>
		</div>
	);
}

BarHeading.propTypes = {
	children: PropTypes.any,
};
