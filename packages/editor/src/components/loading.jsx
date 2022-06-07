/* global __ */
import './loading.css';

const Loading = () => {
	return (
		<div id="elementor-loading">
			<div className="elementor-loader-wrapper">
				<div className="elementor-loader">
					<div className="elementor-loader-boxes">
						<div className="elementor-loader-box"></div>
						<div className="elementor-loader-box"></div>
						<div className="elementor-loader-box"></div>
						<div className="elementor-loader-box"></div>
					</div>
				</div>
				<div className="elementor-loading-title">{__('Loading', 'elementor')}</div>
			</div>
		</div>
	)
}

export default Loading
