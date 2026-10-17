import * as React from 'react';
import { getWidgetsCache } from '@elementor/editor-elements';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../contexts/element-context';
import { Section } from '../section';
import { ExposedStateControl } from './exposed-state-control';
import { getExposedParams } from './exposed-state-values';
import { useElementStateParams } from './use-element-state';

const WIDGET_EL_TYPE = 'widget';

export const StateSection = () => {
	const { element } = useElement();

	if ( getWidgetsCache()?.[ element.type ]?.elType === WIDGET_EL_TYPE ) {
		return null;
	}

	return <ContainerStateSection elementId={ element.id } />;
};

const ContainerStateSection = ( { elementId }: { elementId: string } ) => {
	const { stateParams, updateStateParam } = useElementStateParams( elementId );
	const exposedParams = getExposedParams( stateParams );

	if ( ! exposedParams.length ) {
		return null;
	}

	return (
		<Section title={ __( 'State', 'elementor' ) } defaultExpanded>
			<Stack gap={ 1.5 }>
				{ exposedParams.map( ( param ) => (
					<ExposedStateControl
						key={ param.key }
						param={ param }
						onChange={ ( value ) => updateStateParam( stateParams.indexOf( param ), { default: value } ) }
					/>
				) ) }
			</Stack>
		</Section>
	);
};
