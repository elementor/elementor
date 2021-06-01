export default function BarHeading( props ) {
	return (
		<div className="elementor-admin-top-bar__heading">
			<div className="elementor-admin-top-bar__heading-logo">
				<i className="eicon-elementor" aria-hidden="true"></i>
			</div>
			<h1 className="elementor-admin-top-bar__heading-title">{ props.children }</h1>
		</div>
	);
}

BarHeading.propTypes = {
	children: PropTypes.any,
};
