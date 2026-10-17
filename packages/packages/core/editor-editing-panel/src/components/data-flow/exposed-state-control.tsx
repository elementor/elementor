import * as React from 'react';
import { ControlAdornmentsProvider, PropKeyProvider, PropProvider } from '@elementor/editor-controls';
import { type ElementStateParam } from '@elementor/editor-elements';

import { Control } from '../../controls-registry/control';
import { ControlTypeContainer } from '../../controls-registry/control-type-container';
import { controlsRegistry, type ControlType } from '../../controls-registry/controls-registry';
import { createTopLevelObjectType } from '../../controls-registry/create-top-level-object-type';
import { getFieldIndicators } from '../../field-indicators-registry';
import { ControlLabel } from '../control-label';
import { fromControlValue, toControlValue, toPropType } from './exposed-state-values';

type ExposedStateControlProps = {
	param: ElementStateParam;
	onChange: ( value: unknown ) => void;
};

export const ExposedStateControl = ( { param, onChange }: ExposedStateControlProps ) => {
	const { exposed } = param;

	if ( ! exposed || ! controlsRegistry.get( exposed.control as ControlType ) ) {
		return null;
	}

	const controlType = exposed.control as ControlType;
	const layout = controlsRegistry.getLayout( controlType );
	const propType = createTopLevelObjectType( { schema: { [ param.key ]: toPropType( param ) } } );

	return (
		<PropProvider
			propType={ propType }
			value={ { [ param.key ]: toControlValue( param ) } }
			setValue={ ( newValue ) => onChange( fromControlValue( param, newValue[ param.key ] ) ) }
		>
			<PropKeyProvider bind={ param.key }>
				<ControlAdornmentsProvider items={ getFieldIndicators( 'settings' ) }>
					<ControlTypeContainer layout={ layout }>
						{ layout !== 'custom' && <ControlLabel>{ exposed.label }</ControlLabel> }
						<Control type={ controlType } props={ getControlProps( param, layout ) } />
					</ControlTypeContainer>
				</ControlAdornmentsProvider>
			</PropKeyProvider>
		</PropProvider>
	);
};

function getControlProps( param: ElementStateParam, layout: string | undefined ) {
	const props: Record< string, unknown > = {};

	if ( param.exposed?.control === 'select' ) {
		props.options = ( param.options ?? [] ).map( ( option ) => ( { value: option, label: option } ) );
	}

	if ( layout === 'custom' ) {
		props.label = param.exposed?.label;
	}

	return props;
}
