import * as React from 'react';
import { FormLabel, type FormLabelProps } from '@elementor/ui';

export const ControlFormLabel = ( props: FormLabelProps ) => {
	return <FormLabel size="tiny" { ...props } />;
};
