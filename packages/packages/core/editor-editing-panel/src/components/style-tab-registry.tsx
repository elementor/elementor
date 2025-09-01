import * as React from 'react';

import { type StyleTabSectionProps } from './style-tab-section';

type ExtraSection = StyleTabSectionProps & { id: string };

const DummyComponent = () => <div>Dummy section content</div>;

const extraSections: ExtraSection[] = [
	{
		id: 'dummy-section',
		section: {
			component: DummyComponent,
			name: 'dummy',
			title: 'Dummy Section',
		},
		fields: [ 'color', 'background' ],
		unmountOnExit: false,
	},
];

export function registerStyleTabSection( section: ExtraSection ) {
	extraSections.push( section );
}

export function getExtraStyleTabSections(): ExtraSection[] {
	return extraSections;
}
