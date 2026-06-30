import type * as React from 'react';
import {
	ContainerTemplateIcon,
	PageTemplateIcon,
	PageTypeIcon,
	PostTypeIcon,
	SectionTemplateIcon,
} from '@elementor/icons';

type IconsMap = {
	[ key: string ]: React.ElementType;
};

const initialIconsMap: IconsMap = {
	page: PageTemplateIcon,
	section: SectionTemplateIcon,
	container: ContainerTemplateIcon,
	'wp-page': PageTypeIcon,
	'wp-post': PostTypeIcon,
};

let iconsMap = { ...initialIconsMap };

export function extendIconsMap( additionalIcons: IconsMap ) {
	Object.assign( iconsMap, additionalIcons );
}

export function getIconsMap() {
	return iconsMap;
}

export function resetIconsMap() {
	iconsMap = { ...initialIconsMap };
}
