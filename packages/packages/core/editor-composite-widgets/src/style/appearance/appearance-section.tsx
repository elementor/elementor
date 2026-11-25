import * as React from 'react';
import { Section, SectionContent, SectionsList } from '@elementor/editor-editing-panel';
import { type ElementID } from '@elementor/editor-elements';
import { __ } from '@wordpress/i18n';

import { type CompositeWidgetPreset } from '../../types';
import { PresetField } from './preset-field';

type Props = {
	rootId: ElementID;
	presets: CompositeWidgetPreset[];
};

export function AppearanceSection( { rootId, presets }: Props ) {
	if ( ! presets.length ) {
		return null;
	}

	return (
		<SectionsList>
			<Section title={ __( 'Appearance', 'elementor' ) } defaultExpanded>
				<SectionContent>
					{ presets.map( ( preset ) => (
						<PresetField key={ preset.id } rootId={ rootId } preset={ preset } />
					) ) }
				</SectionContent>
			</Section>
		</SectionsList>
	);
}
