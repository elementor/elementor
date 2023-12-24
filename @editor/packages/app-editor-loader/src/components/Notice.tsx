import React from 'react';
import { Notice as NoticeType } from '../types';

export const Notice: React.FC<NoticeType> = ( props ) => {
	return (
		<div id="e-notice-bar">
			<i className="eicon-elementor-square"></i>
			<div id="e-notice-bar__message">
				{ props.message }
			</div>
			<div id="e-notice-bar__action">
				<a href={ props.action_url } target="_blank" rel="noreferrer">
					{ props.action_title }
				</a>
			</div>
			<i id="e-notice-bar__close" className="eicon-close"></i>
		</div>
	);
};
