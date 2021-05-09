export default function BarHeading( props ) {
	const logoSource = `${ elementorCommon.config.urls.assets }images/logo-icon-rounded.png`;

	return (
		<div className="top-bar-heading-wrapper">
			<img className="top-bar-heading-logo" srcSet={ logoSource } />
			<h1 className="top-bar-heading-title">{ props.children }</h1>
		</div>
	);
}

BarHeading.propTypes = {
	children: PropTypes.any,
};
