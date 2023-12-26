import FormLayout from 'elementor/modules/ai/assets/js/editor/pages/form-layout';
import { render } from '@testing-library/react';
import {
	ConfigProvider,
} from 'elementor/modules/ai/assets/js/editor/pages/form-layout/context/config';
import TestThemeProvider from '../../mock/test-theme-provider';
import { elementorCommon } from '../../mock/elementor-common';
import { addPromptAndGenerate, sleep } from '../../test-utils';
import {
	RemoteConfigProvider,
} from '../../../../../../../../../../modules/ai/assets/js/editor/pages/form-layout/context/remote-config';

describe( 'FormLayout', () => {
	beforeEach( async () => {
		global.elementorCommon = elementorCommon;

		global.ResizeObserver =
			global.ResizeObserver ||
			jest.fn().mockImplementation( () => ( {
				disconnect: jest.fn(),
				observe: jest.fn(),
				unobserve: jest.fn(),
			} ) );
	} );

	it( 'Should render AttachDialog once prompt is url', async () => {
		const props = {
			DialogHeaderProps: {},
			DialogContentProps: {},
			attachments: [],
		};
		const { getByTestId } = render(
			<TestThemeProvider>
				<RemoteConfigProvider onError={ () => {} }>
					<ConfigProvider mode={ 'layout' }
						attachmentsTypes={ {} }
						onClose={ () => {} }
						onConnect={ () => {} }
						onData={ () => {} }
						onInsert={ () => {} }
						onSelect={ () => {} }
						onGenerate={ () => {} }>
						<FormLayout { ...props } />
					</ConfigProvider>
				</RemoteConfigProvider>
			</TestThemeProvider>,
		);

		await addPromptAndGenerate( 'https://www.google.com' );

		await sleep( 1000 );
		const root = getByTestId( 'root' );

		expect( root.querySelector( 'iframe' ) ).not.toBeNull();
		expect( root.querySelector( 'iframe' ).src ).toContain( 'https%3A%2F%2Fwww.google.com' );
	} );
} );
