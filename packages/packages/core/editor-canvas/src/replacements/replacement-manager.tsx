import * as React from 'react';
import { createPortal } from 'react-dom';
import { InlineEditingReplacement } from '@elementor/editor-controls';

import { type ReplacementRegistration, useRegistrations } from './registry';
import { type ReplacementType } from './types';

const ReplacementComponent = ( {
	elementId,
	type,
	props,
}: {
	elementId: string;
	type: ReplacementType;
	props?: Record< string, unknown >;
} ) => {
	switch ( type ) {
		case 'inline-editing':
			return <InlineEditingReplacement elementId={ elementId } { ...props } />;
		default:
			return null;
	}
};

const ReplacementPortal = ( { registration }: { registration: ReplacementRegistration } ) => {
	if ( ! registration.isActive ) {
		return null;
	}

	return createPortal(
		<ReplacementComponent
			elementId={ registration.elementId }
			type={ registration.type }
			props={ registration.props }
		/>,
		registration.targetElement
	);
};

export const ReplacementManager = () => {
	const registrations = useRegistrations();

	return (
		<>
			{ registrations.map( ( reg ) => (
				<ReplacementPortal key={ reg.elementId } registration={ reg } />
			) ) }
		</>
	);
};

