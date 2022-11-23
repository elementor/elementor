import React from 'react';
import { ResponsiveBar } from './ResponsiveBar';
import { Notice } from './Notice';
import { Loading } from './Loading';
import { Notice as NoticeType } from '../types';

type Props = {
	notice: NoticeType,
	loadingText: string,
	iframePreviewURL: string,
	onPreviewLoaded: () => void,
}

export const Preview: React.FC<Props> = ( props ) => {
	return (
		<div id="elementor-preview" style={ {
			width: '100%',
			height: '100%',
		} }>
			<Loading text={ props.loadingText } />

			<ResponsiveBar />

			<div id="elementor-preview-responsive-wrapper"
				className="elementor-device-desktop elementor-device-rotate-portrait"
				style={ {
					width: '100%',
					height: '100%',
				} }
			>
				<iframe
					title="Elementor Preview"
					id="elementor-preview-iframe"
					src={ props.iframePreviewURL }
					allowFullScreen={ true }
					onLoad={ props.onPreviewLoaded }
				></iframe>
				{
					props.notice && <Notice { ...props.notice } />
				}
			</div>
		</div>
	);
};
