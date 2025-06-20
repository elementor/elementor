import * as React from 'react';
import { List, type ListProps } from '@elementor/ui';

export function SectionsList( props: ListProps ) {
	return <List disablePadding component="div" { ...props } />;
}
