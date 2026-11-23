import * as React from 'react';
import { __, sprintf } from '@wordpress/i18n';

import { postTypesMap } from '../../api/post';
import { usePostListContext } from '../../contexts/post-list-context';
import useCanCreate from '../../hooks/use-can-create';
import ContentPanelAddIconButton from './content-panel-add-icon-button';

type Props = {
	onBeforeCreate?: () => void;
};

export default function SectionAddButton( { onBeforeCreate }: Props ) {
	const { type, setEditMode } = usePostListContext();
	const canCreate = useCanCreate( type );
	const singularName = postTypesMap[ type ].labels.singular_name;
	const ariaLabel = sprintf(
		/* translators: %s: Post type singular name (e.g. Page, Post). */
		__( 'New %s', 'elementor' ),
		singularName
	);

	return (
		<ContentPanelAddIconButton
			aria-label={ ariaLabel }
			disabled={ ! canCreate }
			onClick={ ( event ) => {
				event.stopPropagation();
				onBeforeCreate?.();
				setEditMode( { mode: 'create', details: {} } );
			} }
		/>
	);
}
