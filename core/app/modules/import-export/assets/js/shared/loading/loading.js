export default function Loading( props ) {
	return (
		<div className={ `import-export-loading ${ props.className }` }>
			<div className="import-export-loading__content">
				<div className="elementor-loader-wrapper">
					<div className="elementor-loader">
						<div className="elementor-loader-boxes">
							<div className="elementor-loader-box"></div>
							<div className="elementor-loader-box"></div>
							<div className="elementor-loader-box"></div>
							<div className="elementor-loader-box"></div>
						</div>
					</div>
					<div className="elementor-loading-title">{ __( 'Loading', 'elementor' ) }</div>
				</div>
			</div>
		</div>
	);
}

Loading.propTypes = {
	className: PropTypes.string,
};

Loading.defaultProps = {
	className: '',
};
