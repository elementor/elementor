import { SvgIcon } from '@elementor/ui';

export const ImageLandscapePlaceholder = ( props ) => {
	return (
		<SvgIcon viewBox="0 0 600 260" { ...props }>
			<rect x="0" y="0" width="600" height="260" fill="#d9d9d9" />
		</SvgIcon>
	);
};

export const ImageSquarePlaceholder = ( props ) => {
	return (
		<SvgIcon viewBox="0 0 500 500" { ...props }>
			<rect x="0" y="0" width="500" height="500" fill="#d9d9d9" />
		</SvgIcon>
	);
};
