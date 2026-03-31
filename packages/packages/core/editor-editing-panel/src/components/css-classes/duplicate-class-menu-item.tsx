import * as React from 'react';
import { stylesRepository, useUserStylesCapability } from '@elementor/editor-styles-repository';
import { MenuItemInfotip, MenuListItem } from '@elementor/editor-ui';
import { useSessionStorage } from '@elementor/session';
import { __ } from '@wordpress/i18n';

import { trackStyles } from '../../utils/tracking/subscribe';
import { PENDING_CLASS_RENAME_SESSION_KEY } from './consts';
import { useCssClass } from './css-class-context';
import { useApplyClass } from './use-apply-and-unapply-class';

const DUPLICATE_LABEL_PREFIX = 'copy-of';

export function getUniqueDuplicateLabel( originalLabel: string, existingLabels: string[] ): string {
	let newLabel = `${ DUPLICATE_LABEL_PREFIX }-${ originalLabel }`;
	let counter = 2;
	while ( existingLabels.includes( newLabel ) ) {
		newLabel = `${ DUPLICATE_LABEL_PREFIX }-${ originalLabel }-${ counter }`;
		counter++;
	}
	return newLabel;
}

export function DuplicateClassMenuItem( { closeMenu }: { closeMenu: () => void } ) {
	const { id: classId, provider } = useCssClass();
	const { userCan } = useUserStylesCapability();
	const applyClass = useApplyClass();
	const [ , setPendingEditId ] = useSessionStorage( PENDING_CLASS_RENAME_SESSION_KEY, 'app' );

	if ( ! provider || ! classId ) {
		return null;
	}

	const providerInstance = stylesRepository.getProviderByKey( provider );
	const createAction = providerInstance?.actions.create;
	const getAction = providerInstance?.actions.get;

	if ( ! createAction || ! getAction ) {
		return null;
	}

	const isAllowed = userCan( provider ).create;

	const handleDuplicate = () => {
		if ( ! isAllowed ) {
			return;
		}
		const styleDef = getAction( classId );
		if ( ! styleDef ) {
			closeMenu();
			return;
		}
		const existingLabels = providerInstance.actions.all().map( ( style ) => style.label );
		const newLabel = getUniqueDuplicateLabel( styleDef.label, existingLabels );
		const newId = createAction( newLabel, styleDef.variants );
		if ( newId ) {
			applyClass( { classId: newId, classLabel: newLabel } );
			setPendingEditId( newId );
			trackStyles( provider, 'classCreated', {
				classId: newId,
				source: 'duplicated',
				classTitle: newLabel,
			} );
		}
		closeMenu();
	};

	return (
		<MenuListItem disabled={ ! isAllowed } onClick={ handleDuplicate }>
			<MenuItemInfotip
				showInfoTip={ ! isAllowed }
				content={ __(
					"With your current role, you can use existing classes but can't modify them.",
					'elementor'
				) }
			>
				{ __( 'Duplicate', 'elementor' ) }
			</MenuItemInfotip>
		</MenuListItem>
	);
}
