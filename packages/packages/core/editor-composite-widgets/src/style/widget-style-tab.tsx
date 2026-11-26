import * as React from 'react';
import {
	Section,
	SectionContent,
	SectionsList,
	StyleTab,
	useElement,
	useStateByElement,
} from '@elementor/editor-editing-panel';
import { type ElementID } from '@elementor/editor-elements';
import { CollapseIcon } from '@elementor/editor-ui';
import { Box, Button } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useWidgetDefinition } from '../general/use-widget-definition';
import { type CompositeWidgetQuickEdit } from '../types';
import { AppearanceSection } from './appearance/appearance-section';
import { QuickEditField } from './quick-edit-field';

export function WidgetStyleTab() {
	const { element } = useElement();
	const definition = useWidgetDefinition( element.id );
	const [ isContainerOpen, setIsContainerOpen ] = useStateByElement( 'widget-edit-container', false );

	return (
		<>
			<AppearanceSection rootId={ element.id } presets={ definition?.style?.appearance ?? [] } />
			<QuickEditSection rootId={ element.id } quickEdits={ definition?.style?.quick_edit ?? [] } />
			<Box sx={ { px: 2, py: 1.5 } }>
				<Button
					fullWidth
					size="small"
					color="secondary"
					variant="outlined"
					aria-expanded={ isContainerOpen }
					endIcon={ <CollapseIcon open={ isContainerOpen } fontSize="tiny" /> }
					onClick={ () => setIsContainerOpen( ! isContainerOpen ) }
				>
					{ __( 'Edit container', 'elementor' ) }
				</Button>
			</Box>
			{ isContainerOpen && <StyleTab /> }
		</>
	);
}

type QuickEditSectionProps = {
	rootId: ElementID;
	quickEdits: CompositeWidgetQuickEdit[];
};

function QuickEditSection( { rootId, quickEdits }: QuickEditSectionProps ) {
	if ( ! quickEdits.length ) {
		return null;
	}

	return (
		<SectionsList>
			<Section title={ __( 'Quick edit', 'elementor' ) } defaultExpanded>
				<SectionContent>
					{ quickEdits.map( ( quickEdit, index ) => (
						<QuickEditField key={ index } rootId={ rootId } quickEdit={ quickEdit } />
					) ) }
				</SectionContent>
			</Section>
		</SectionsList>
	);
}
