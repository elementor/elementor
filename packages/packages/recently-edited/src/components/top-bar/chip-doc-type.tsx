import {
	ArchiveTemplateIcon,
	HeaderTemplateIcon,
	FooterTemplateIcon,
	PostTypeIcon,
	PageTypeIcon,
	PopupTemplateIcon,
	SearchResultsTemplateIcon,
	Error404TemplateIcon,
	LoopItemTemplateIcon,
	LandingPageTemplateIcon,
	PageTemplateIcon,
	SectionTemplateIcon,
	ContainerTemplateIcon,
} from '@elementor/icons';
import { Chip } from '@elementor/ui';
import { DocType } from '../../types';
import * as React from 'react';

type DocTypes = {
	[key in DocType]: React.ElementType;
};

const iconsDocType: DocTypes = {
	header: HeaderTemplateIcon,
	footer: FooterTemplateIcon,
	'single-post': PostTypeIcon,
	'single-page': PageTypeIcon,
	popup: PopupTemplateIcon,
	archive: ArchiveTemplateIcon,
	'search-results': SearchResultsTemplateIcon,
	'loop-item': LoopItemTemplateIcon,
	'error-404': Error404TemplateIcon,
	'landing-page': LandingPageTemplateIcon,
	page: PageTemplateIcon,
	section: SectionTemplateIcon,
	container: ContainerTemplateIcon,
	'wp-page': PageTypeIcon,
	'wp-post': PostTypeIcon,
};

export type Props = {
	postType: string;
	docType: DocType;
	label: string;
};
export default function DocTypeChip( { postType, docType, label }: Props ) {
	const color = 'elementor_library' === postType ? 'global' : 'primary';
	const Icon = iconsDocType?.[ docType ] || PostTypeIcon;

	return (
		<Chip
			size="medium"
			variant="standard"
			label={ label }
			color={ color }
			icon={ <Icon /> }
		/>
	);
}
