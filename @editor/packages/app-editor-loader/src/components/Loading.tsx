import React from 'react';
import './loading.css';

type Props = {
	text: string,
}

export const Loading: React.FC<Props> = ( props ) => {
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
				<div className="elementor-loading-title">{ props.text }</div>
			</div>
		</div>
	);
};
