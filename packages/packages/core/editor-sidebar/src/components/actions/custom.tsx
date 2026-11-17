import * as React from 'react';
import { type ComponentType } from 'react';

export type Props = {
	component: ComponentType;
};

export default function Custom( { component: Component }: Props ) {
	return <Component />;
}
