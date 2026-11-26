import * as React from 'react';
import { List, Skeleton, Stack } from '@elementor/ui';

import { type Slug } from '../../api/post';
import { PostListContextProvider } from '../../contexts/post-list-context';
import { useSiteContentPanelSectionsFilter } from '../../contexts/site-content-panel-sections-filter';
import { getSiteContentSections } from '../../site-content-sections';
import PostsCollapsibleList from './posts-list/posts-collapsible-list';
import UserLoadError from './user-load-error';

type ShellPanelBodyContentProps = {
	accessiblePostTypes: Slug[];
	isUserPending: boolean;
	onListError: () => void;
	showUserLoadError: boolean;
};

export default function ShellPanelBodyContent( {
	accessiblePostTypes,
	isUserPending,
	onListError,
	showUserLoadError,
}: ShellPanelBodyContentProps ) {
	if ( isUserPending ) {
		return (
			<Stack spacing={ 1 } sx={ { px: 2, py: 1 } }>
				<Skeleton animation="wave" height={ 28 } variant="rounded" width="100%" />
				<Skeleton animation="wave" height={ 28 } variant="rounded" width="80%" />
			</Stack>
		);
	}

	if ( showUserLoadError ) {
		return <UserLoadError />;
	}

	return <ShellPanelBodySections accessiblePostTypes={ accessiblePostTypes } onListError={ onListError } />;
}

function ShellPanelBodySections( {
	accessiblePostTypes,
	onListError,
}: {
	accessiblePostTypes: Slug[];
	onListError: () => void;
} ) {
	const { isSectionVisible } = useSiteContentPanelSectionsFilter();
	const extraSections = getSiteContentSections();
	const visiblePostTypes = accessiblePostTypes.filter( ( postTypeSlug ) => isSectionVisible( postTypeSlug ) );
	const visibleSections = extraSections.filter( ( section ) => isSectionVisible( section.id ) );

	return (
		<List dense disablePadding sx={ { py: 0, width: '100%' } }>
			{ visiblePostTypes.map( ( postTypeSlug, index ) => (
				<PostListContextProvider key={ postTypeSlug } type={ postTypeSlug } setError={ onListError }>
					<PostsCollapsibleList isOpenByDefault={ index === 0 } />
				</PostListContextProvider>
			) ) }
			{ visibleSections.map( ( section ) => (
				<React.Fragment key={ section.id }>{ section.render() }</React.Fragment>
			) ) }
		</List>
	);
}