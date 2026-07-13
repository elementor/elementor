import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const PLUS_PATH =
	'M20.7273 2.72725C21.8317 2.72726 22.7271 3.62279 22.7273 4.72725V11.8171H29.8181C30.9226 11.8171 31.818 12.7126 31.8181 13.8171V20.7263C31.818 21.8308 30.9226 22.7263 29.8181 22.7263H22.7273V29.8181C22.7273 30.9226 21.8318 31.8181 20.7273 31.8181H13.8181C12.7136 31.818 11.8181 30.9226 11.8181 29.8181V22.7263H4.72725C3.62282 22.7261 2.72729 21.8307 2.72725 20.7263V13.8171C2.72731 12.7127 3.62284 11.8172 4.72725 11.8171H11.8181V4.72725C11.8182 3.62283 12.7136 2.72733 13.8181 2.72725H20.7273Z';

const PlusIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >(
	( { sx, ...props }, ref ) => {
		return (
			<SvgIcon viewBox="0 0 34.545 34.545" { ...props } ref={ ref } sx={ { overflow: 'visible', ...sx } }>
				<path d={ PLUS_PATH } fill="none" stroke="#ffffff" strokeWidth="5.454" strokeLinejoin="round" />
				<path d={ PLUS_PATH } fill="currentColor" />
			</SvgIcon>
		);
	}
);

export default PlusIcon;
