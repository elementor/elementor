import React from 'react';
import { SvgIcon } from '@elementor/ui';

const BulbIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon { ...props } ref={ ref }>
			<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clipPath="url(#clip0_10743_8902)">
					<path d="M2.75 10.0833H3.66667M11 2.75V3.66667M18.3333 10.0833H19.25M5.13333 5.13333L5.775 5.775M16.8667 5.13333L16.225 5.775" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
					<path d="M9.16675 16.041C8.70841 15.1243 6.91205 13.2842 6.62523 12.366C6.3384 11.4477 6.34775 10.4626 6.65195 9.54997C6.95615 8.63738 7.53978 7.84362 8.32016 7.28116C9.10054 6.71869 10.0381 6.41602 11.0001 6.41602C11.962 6.41602 12.8996 6.71869 13.68 7.28116C14.4604 7.84362 15.044 8.63738 15.3482 9.54997C15.6524 10.4626 15.6618 11.4477 15.3749 12.366C15.0881 13.2842 13.2917 15.1243 12.8334 16.041C12.8334 16.041 12.7597 17.3762 12.8334 17.8743C12.8334 18.3606 12.6403 18.8269 12.2964 19.1707C11.9526 19.5145 11.4863 19.7077 11.0001 19.7077C10.5139 19.7077 10.0475 19.5145 9.70372 19.1707C9.3599 18.8269 9.16675 18.3606 9.16675 17.8743C9.2405 17.3762 9.16675 16.041 9.16675 16.041Z" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
					<path d="M10.0833 16.5H11.9166" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</g>
				<defs>
					<clipPath id="clip0_10743_8902">
						<rect width="22" height="22" fill="white" />
					</clipPath>
				</defs>
			</svg>

		</SvgIcon>
	);
} );

export default BulbIcon;
