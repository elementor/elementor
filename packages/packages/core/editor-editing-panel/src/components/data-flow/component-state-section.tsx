import * as React from 'react';
import { type ElementStateParam } from '@elementor/editor-elements';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { Section } from '../section';
import { StateValueField } from './state-value-field';
import { formatStateValue } from './state-values';
import { useElementStateValues } from './use-element-state';

const DATA_FLOW_EXPERIMENT = 'e_data_flow';

type ComponentStateSectionProps = {
	componentId: number;
	elementId: string;
};

export const ComponentStateSection = ( { componentId, elementId }: ComponentStateSectionProps ) => {
	const params = getComponentStateParams( componentId );

	if ( ! isExperimentActive( DATA_FLOW_EXPERIMENT ) || ! params.length ) {
		return null;
	}

	return <ComponentStateFields elementId={ elementId } params={ params } />;
};

const ComponentStateFields = ( { elementId, params }: { elementId: string; params: ElementStateParam[] } ) => {
	const { state, setValue, clearValue } = useElementStateValues( elementId );

	return (
		<Section title={ __( 'State', 'elementor' ) } defaultExpanded>
			<Stack gap={ 1.5 }>
				<Typography variant="caption" color="text.secondary">
					{ __( 'Values for this instance. Leave empty to use the component default.', 'elementor' ) }
				</Typography>
				{ params.map( ( param ) => (
					<StateValueField
						key={ param.key }
						label={ param.label || param.key }
						type={ param.type }
						value={ state[ param.key ] ?? '' }
						placeholder={ formatStateValue( param.default ) }
						onChange={ ( input, value ) =>
							input === '' ? clearValue( param.key ) : setValue( param.key, value )
						}
					/>
				) ) }
			</Stack>
		</Section>
	);
};

function getComponentStateParams( componentId: number ): ElementStateParam[] {
	return window.elementor?.config?.dataFlow?.componentParams?.[ componentId ] ?? [];
}
