import * as React from 'react';
import { injectIntoTop } from '@elementor/editor';
import { controlActionsMenu, registerControlReplacement, useBoundProp } from '@elementor/editor-editing-panel';
import { injectTab } from '@elementor/editor-elements-panel';
import { createPropUtils } from '@elementor/editor-props';
import { PopoverBody, PopoverHeader } from '@elementor/editor-ui';
import { SettingsIcon } from '@elementor/icons';
import { z } from '@elementor/schema';
import { Button, Divider, UnstableTag as Tag } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ComponentsTab } from './components/components-tab';
import { CreateComponentForm } from './components/create-component-form/create-component-form';

function usePropComponentsAction() {
	return {
		visible: true,
		icon: SettingsIcon,
		title: __( 'Components', 'elementor' ),
		content: ( { close } ) => <ComponentsPopover close={ close } />,
	};
}

function ComponentsTag() {
	return (
		<Tag
			fullWidth
			showActionsOnHover
			label={ 'The __title is binded' }
			startIcon={ <SettingsIcon fontSize={ 'small' } /> }
		/>
	);
}

function ComponentsPopover( { close }: { close: () => void } ) {
	const { setValue } = useBoundProp();

	return (
		<PopoverBody>
			<PopoverHeader title={ __( 'Components', 'elementor' ) } onClose={ close } />
			<Divider />
			<Button
				onClick={ () => {
					setValue( {
						$$type: 'overrides-placeholder',
						value: { key: '__title', value: 'This is the default of the placeholder' },
					} );
					close();
				} }
			>
				Set __title placeholder
			</Button>
		</PopoverBody>
	);
}

export function init() {
	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: ComponentsTab,
	} );

	injectIntoTop( {
		id: 'create-component-popup',
		component: CreateComponentForm,
	} );

	controlActionsMenu.registerPopoverAction( {
		id: 'components',
		useProps: usePropComponentsAction,
	} );

	registerControlReplacement( {
		condition: ( { value } ) => value.$$type === 'overrides-placeholder',
		component: ComponentsTag,
	} );
}
