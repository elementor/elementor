import {
	MenuItem,
	ListSubheader,
	Typography,
} from '@elementor/ui';

import { __, isRTL } from '@wordpress/i18n';
import DocTypeChip, { Props } from '../top-bar/chip-doc-type';
import { Post } from '../../hooks/use-recent-posts';

export type RecentPostsProps = {
	recentPosts: Post[];
};

export default function PostsList( { recentPosts }: RecentPostsProps ) {
	return (
		<>
			<ListSubheader sx={ { fontSize: 12, fontStyle: 'italic', fontWeight: 300, pl: 4 } } component="div" id="nested-list-subheader">
				{ __( 'Recent', 'elementor' ) }
			</ListSubheader>

			{ recentPosts.length
				? ( recentPosts.map( ( { title, edit_url: editUrl, type, id } ) => (
					<MenuItem
						key={ id }
						component="a"
						href={ editUrl }
					>
						{ title }
						<DocTypeChip postType={ type.post_type } docType={ type.doc_type as Props['docType'] } label={ type.label } />
					</MenuItem>
				) ) ) : (
					<Typography variant="caption" sx={ { color: 'grey.500', fontStyle: 'italic', fontWeight: 300, p: 4, ...( isRTL() ? { pl: '25px' } : { pr: '25px' } ) } } component="div" aria-label={ undefined }>
						{ __( 'There are no other pages or templates on this site yet.', 'elementor' ) }
					</Typography>
				)
			}
		</>
	);
}
