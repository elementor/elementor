import * as React from 'react';

import { STYLE_SECTIONS } from './style-sections-definition';
import { StyleTabSection } from './style-tab-section';

export const StyleSections = () => {
  return (
    <>
      { STYLE_SECTIONS.map( ( section ) => (
        <StyleTabSection
          key={ section.name }
          section={ {
            component: section.component,
            name: section.name,
            title: section.title,
          } }
          fields={ section.fields }
        />
      ) ) }
    </>
  );
};
