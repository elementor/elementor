import React from 'react';
import { SvgIcon } from '@elementor/ui';

const BulbIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon width="23" height="22" viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg" { ...props } ref={ ref }>
			<g clipPath="url(#clip0_10733_3056)">
				<path d="M3.10791 10.0833H4.02458M11.3579 2.75V3.66667M18.6912 10.0833H19.6079M5.49124 5.13333L6.13291 5.775M17.2246 5.13333L16.5829 5.775" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M9.52466 16.041C9.06632 15.1243 7.26996 13.2842 6.98314 12.366C6.69631 11.4477 6.70566 10.4626 7.00986 9.54997C7.31406 8.63738 7.89769 7.84362 8.67807 7.28116C9.45845 6.71869 10.396 6.41602 11.358 6.41602C12.32 6.41602 13.2575 6.71869 14.0379 7.28116C14.8183 7.84362 15.4019 8.63738 15.7061 9.54997C16.0103 10.4626 16.0197 11.4477 15.7328 12.366C15.446 13.2842 13.6497 15.1243 13.1913 16.041C13.1913 16.041 13.1176 17.3762 13.1913 17.8743C13.1913 18.3606 12.9982 18.8269 12.6544 19.1707C12.3105 19.5145 11.8442 19.7077 11.358 19.7077C10.8718 19.7077 10.4054 19.5145 10.0616 19.1707C9.71781 18.8269 9.52466 18.3606 9.52466 17.8743C9.59841 17.3762 9.52466 16.041 9.52466 16.041Z" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M10.4412 16.5H12.2745" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
			</g>
			<defs>
				<clipPath id="clip0_10733_3056">
					<rect width="22" height="22" fill="white" transform="translate(0.35791)" />
				</clipPath>
			</defs>
		</SvgIcon>
	);
} );

export default BulbIcon;
