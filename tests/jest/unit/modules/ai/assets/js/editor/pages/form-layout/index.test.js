import FormLayout from 'elementor/modules/ai/assets/js/editor/pages/form-layout';
import { render } from '@testing-library/react';
import {
	ConfigProvider,
} from 'elementor/modules/ai/assets/js/editor/pages/form-layout/context/config';
import { elementorCommon } from '../../mock/elementor-common';
import TestThemeProvider from '../../mock/test-theme-provider';
import { addPromptAndGenerate, mockResizeObserver, sleep } from '../../test-utils';
import {
	RemoteConfigProvider,
} from 'elementor/modules/ai/assets/js/editor/pages/form-layout/context/remote-config';

describe( 'FormLayout', () => {
	beforeEach( async () => {
		global.elementorCommon = elementorCommon;
		mockResizeObserver();
	} );

	it( 'Should render AttachDialog iframe once prompt is url', async () => {
		const { getByTestId } = renderElement();

		await addPromptAndGenerate( 'https://www.google.com' );
		await sleep( 1000 );

		const root = getByTestId( 'root' );

		expect( root.querySelector( 'iframe' ) ).not.toBeNull();
		expect( root.querySelector( 'iframe' ).src ).toContain( 'https%3A%2F%2Fwww.google.com' );
	} );

	it( 'Should not render AttachDialog iframe when prompt is not url', async () => {
		const { getByTestId } = renderElement();

		await addPromptAndGenerate( 'How are you doing?' );
		// Await sleep( 1000 );

		const root = getByTestId( 'root' );

		expect( root.querySelector( 'iframe' ) ).toBeNull();
	} );

	const renderElement = ( ) => {
		const props = {
			DialogHeaderProps: {},
			DialogContentProps: {},
			attachments: [],
		};

		return render(
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
	};
} );
