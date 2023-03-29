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
} from '@elementor/icons';
import { Chip } from '@elementor/ui';

const iconsDocType = {
	header: HeaderTemplateIcon,
	footer: FooterTemplateIcon,
	single_post: PostTypeIcon,
	single_page: PageTypeIcon,
	popup: PopupTemplateIcon,
	archive: ArchiveTemplateIcon,
	search_results: SearchResultsTemplateIcon,
	loop_item: LoopItemTemplateIcon,
	error_404: Error404TemplateIcon,
	wp_page: PageTypeIcon,
	wp_post: PostTypeIcon,
} as const;

type DocType = keyof typeof iconsDocType;

export type Props = {
	postType: string;
	docType: DocType;
	label: string;
};
export default function ChipByDocType( { postType, docType, label }: Props ) {
	const color = 'elementor_library' === postType ? 'global' : 'primary';
	// key cant contain '-'
	const docTypeReplaced = docType.replace( '-', '_' ) as DocType;
	const Icon = iconsDocType[ docTypeReplaced ];

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
