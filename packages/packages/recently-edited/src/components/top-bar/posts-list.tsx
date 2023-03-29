import {
	MenuItem,
	ListSubheader,
} from '@elementor/ui';

import ChipByDocType, { Props } from '../top-bar/chip-doc-type';
import { Post } from '../../utils/fetch-posts';

export type RecentPostsProps = {
	recentPosts: Post[];
};

export default function PostsList( { recentPosts }: RecentPostsProps ) {
	return (
		<>
			<ListSubheader sx={ { fontSize: 12, fontStyle: 'italic', pl: 4 } } component="div" id="nested-list-subheader">
				Recent
			</ListSubheader>

			{ recentPosts.map( ( { title, edit_url: editUrl, type, id }, index ) => (
				<MenuItem
					key={ id + '-' + index }
					component="a"
					href={ editUrl }
				>
					{ title }
					<ChipByDocType postType={ type.post_type } docType={ type.doc_type as Props['docType'] } label={ type.label } />
				</MenuItem>
			) ) }
		</>
	);
}
