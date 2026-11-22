import * as React from 'react';
import { __, sprintf } from '@wordpress/i18n';

import { getPostTypeCreateCapability, postTypesMap } from '../../api/post';
import { usePostListContext } from '../../contexts/post-list-context';
import useUser from '../../hooks/use-user';
import ContentPanelAddIconButton from './content-panel-add-icon-button';

type Props = {
	onBeforeCreate?: () => void;
};

export default function SectionAddButton( { onBeforeCreate }: Props ) {
	const { type, setEditMode } = usePostListContext();
	const { data: user } = useUser();
	const createCapability = getPostTypeCreateCapability( type );
	const singularName = postTypesMap[ type ].labels.singular_name;
	const ariaLabel = sprintf(
		/* translators: %s: Post type singular name (e.g. Page, Post). */
		__( 'New %s', 'elementor' ),
		singularName
	);

	return (
		<ContentPanelAddIconButton
			aria-label={ ariaLabel }
			disabled={ ! user?.capabilities?.[ createCapability ] }
			onClick={ ( event ) => {
				event.stopPropagation();
				onBeforeCreate?.();
				setEditMode( { mode: 'create', details: {} } );
			} }
		/>
	);
}
