import * as React from 'react';
import { type PropsWithChildren } from 'react';
import {
	type ControlActionsItems,
	ControlActionsProvider,
	PropKeyProvider,
	PropProvider,
	type PropProviderProps,
} from '@elementor/editor-controls';
import { type ObjectPropType, type PropKey, type PropType, type PropValue } from '@elementor/editor-props';
import { QueryClient, QueryClientProvider } from '@elementor/query';

import { renderWithTheme } from './render-with-theme';

export type RenderControlProps = Partial< PropProviderProps< PropValue, PropType > > & {
	bind?: PropKey;
	controlActions?: ControlActionsItems;
	propType: PropType;
};

const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
const QueryClientWrapper = ( { children }: PropsWithChildren ) => (
	<QueryClientProvider client={ queryClient }>{ children } </QueryClientProvider>
);

export const renderControl = ( ui: React.ReactElement, props: RenderControlProps ) => {
	const { bind = '', controlActions = [], setValue: setValueProp = jest.fn(), isDisabled, placeholder } = props;

	const propType: ObjectPropType = {
		key: '',
		kind: 'object',
		meta: {},
		settings: {},
		default: null,
		shape: {
			[ bind ]: props.propType,
		},
	};

	const setValue = ( value: Record< string, PropValue > ) => {
		setValueProp( value[ bind ] );
	};

	const value = { [ bind ]: props.value };
	const placeholderValue = placeholder ? { [ bind ]: placeholder } : undefined;

	const { rerender, ...rest } = renderWithTheme(
		<QueryClientWrapper>
			<PropProvider
				propType={ propType }
				value={ value }
				setValue={ setValue }
				isDisabled={ isDisabled }
				placeholder={ placeholderValue }
			>
				<PropKeyProvider bind={ bind }>
					<ControlActionsProvider items={ controlActions }>{ ui }</ControlActionsProvider>
				</PropKeyProvider>
			</PropProvider>
		</QueryClientWrapper>
	);

	return {
		...rest,
		rerender: ( rerenderUi: React.ReactElement, rerenderProps = {} ) => {
			rerender(
				<QueryClientWrapper>
					<PropProvider
						propType={ propType }
						value={ value }
						setValue={ setValue }
						placeholder={ placeholderValue }
						{ ...rerenderProps }
					>
						<PropKeyProvider bind={ bind }>
							<ControlActionsProvider items={ controlActions }>{ rerenderUi }</ControlActionsProvider>
						</PropKeyProvider>
					</PropProvider>
				</QueryClientWrapper>
			);
		},
	};
};
