import * as React from 'react';
import SvgIcon from '@elementor/ui/SvgIcon';

const SVG_ELEMENT_ICON_PATH =
	'M502 772c10 0 19-6 24-14l201-351c4-9 4-19 0-27-5-9-14-14-24-14h-401c-10 0-19 5-24 14-4 8-5 18 0 27l201 351c5 8 14 14 23 14z m0-82l-154-270h309l-154 270z m-323-471c-6 0-12-2-16-7-4-4-7-10-7-16v-201c0-6 3-12 7-16 4-5 10-7 16-7h201c6 0 12 2 16 7 5 4 7 10 7 16v201c0 6-2 12-7 16-4 5-10 7-16 7h-201z m-54 32c14 14 34 22 54 22h201c20 0 40-8 55-22 14-15 22-35 22-55v-201c0-20-8-40-22-54-15-15-35-23-55-23h-201c-20 0-40 8-54 23-15 14-23 34-23 54v201c0 20 8 40 23 55z m480-30c34 33 79 52 126 52s92-19 125-52c34-33 52-78 52-125s-18-93-52-126c-33-33-78-52-125-52s-92 19-126 52c-33 33-52 78-52 126s19 92 52 125z m126-2c-33 0-64-13-87-36-24-23-37-55-37-87s13-65 37-88c23-23 54-36 87-36s64 13 87 36c23 23 36 55 36 88s-13 64-36 87c-23 23-54 36-87 36z';

export const SvgElementIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >(
	( props, ref ) => (
		<SvgIcon viewBox="0 0 1000 1000" { ...props } ref={ ref }>
			<g transform="translate(0, 850) scale(1, -1)">
				<path d={ SVG_ELEMENT_ICON_PATH } />
			</g>
		</SvgIcon>
	)
);
