import * as React from 'react';

import { useCallback } from 'react';
import { InlineEditor } from '@elementor/editor-controls';
import { updateElementSettings } from '@elementor/editor-elements';
import { htmlPropTypeUtil } from '@elementor/editor-props';
import { ThemeProvider } from '@elementor/editor-ui';

type InlineEditingReplacementProps = {
	elementId: string;
	propName: string;
	initialValue: string;
	classes?: string;
	expectedTag?: string | null;
	toolbarOffset?: { left: number; top: number };
	onComplete?: () => void;
};

export const InlineEditingReplacement = ( {
	elementId,
	propName,
	initialValue,
	classes = '',
	expectedTag = null,
	toolbarOffset = { left: 0, top: 0 },
	onComplete,
}: InlineEditingReplacementProps ) => {
	const handleChange = useCallback(
		( newValue: string | null ) => {
			const valueToSave = newValue ? htmlPropTypeUtil.create( newValue ) : null;

			updateElementSettings( {
				id: elementId,
				props: { [ propName ]: valueToSave },
			} );
		},
		[ elementId, propName ]
	);

	return (
		<ThemeProvider>
			<InlineEditor
				attributes={ { class: classes } }
				value={ initialValue }
				setValue={ handleChange }
				expectedTag={ expectedTag }
				getInitialPopoverPosition={ () => toolbarOffset }
				onBlur={ onComplete }
				showToolbar
				autofocus
			/>
		</ThemeProvider>
	);
};

