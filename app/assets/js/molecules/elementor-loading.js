export default function ElementorLoading( props ) {
	return (
		<div className="elementor-loading">
			<div className="elementor-loader-wrapper">
				<div className="elementor-loader">
					<div className="elementor-loader-boxes">
						<div className="elementor-loader-box" />
						<div className="elementor-loader-box" />
						<div className="elementor-loader-box" />
						<div className="elementor-loader-box" />
					</div>
				</div>
				<div className="elementor-loading-title">{ props.loadingText }</div>
			</div>
		</div>
	);
}

ElementorLoading.propTypes = {
	loadingText: PropTypes.string,
};

ElementorLoading.defaultProps = {
	loadingText: __( 'Loading', 'elementor' ),
};
