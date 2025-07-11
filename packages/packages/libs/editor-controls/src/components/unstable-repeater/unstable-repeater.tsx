import * as React from 'react';

import { SectionContent } from '../section-content';

export const UnstableRepeater = ( { children }: { children: React.ReactNode } ) => {
	return <SectionContent>{ children }</SectionContent>;
};
