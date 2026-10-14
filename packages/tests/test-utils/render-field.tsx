import * as React from 'react';
import { type ControlActionsItems, ControlActionsProvider, type PropProviderProps } from '@elementor/editor-controls';
import { type PropKey, type PropType, type PropValue } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';

import { renderWithTheme } from './render-with-theme';

type RenderControlProps = Partial< PropProviderProps< PropValue, PropType > > & {
	bind?: PropKey;
	controlActions?: ControlActionsItems;
	propTypes: Record< string, PropType >;
};

jest.mock( '@elementor/editor-styles', () => ( {
	...jest.requireActual( '@elementor/editor-styles' ),
	getStylesSchema: jest.fn(),
} ) );

export const renderField = ( ui: React.ReactElement, props: RenderControlProps ) => {
	const { propTypes = {}, controlActions = [] } = props;

	jest.mocked( getStylesSchema ).mockReturnValue( propTypes );

	return renderWithTheme( <ControlActionsProvider items={ controlActions }>{ ui }</ControlActionsProvider> );
};
