import FormLayout from 'elementor/modules/ai/assets/js/editor/pages/form-layout';
import { fireEvent, render, screen } from '@testing-library/react';
import {
	ConfigProvider,
} from 'elementor/modules/ai/assets/js/editor/pages/form-layout/context/config';
import TestThemeProvider from '../../mock/test-theme-provider';
import { addPromptAndGenerate, mockEditorEnvironment, sleep, waitForNextTick } from '../../test-utils';
import {
	RemoteConfigProvider,
} from 'elementor/modules/ai/assets/js/editor/pages/form-layout/context/remote-config';
import LayoutApp from 'elementor/modules/ai/assets/js/editor/layout-app';
import { SCREENSHOT_LIGHT_1 } from '../../mock/data';
import { MAX_PAGES } from 'elementor/modules/ai/assets/js/editor/pages/form-layout/hooks/use-slider';
import { RequestIdsProvider } from 'elementor/modules/ai/assets/js/editor/context/requests-ids';

describe( 'FormLayout', () => {
	const REGENERATE_ATTEMPTS_INCLUDING_FIRST_GENERATE = MAX_PAGES - 1;
	beforeEach( async () => {
		mockEditorEnvironment();
	} );

	it( 'Should render AttachDialog iframe once prompt is url', async () => {
		global.$e.run = jest.fn();

		renderElement();

		await addPromptAndGenerate( 'https://www.google.com' );
		await sleep( 1000 );

		expect( global.$e.run ).toHaveBeenCalledWith( 'ai-integration/open-choose-element', {
			url: 'https://www.google.com',
		} );

		delete global.$e.run;
	} );

	it( 'Should not render AttachDialog iframe when prompt is not url', async () => {
		const { getByTestId } = renderElement();

		await addPromptAndGenerate( 'Test: How are you doing?' );

		const root = getByTestId( 'root' );

		expect( root.querySelector( 'iframe' ) ).toBeNull();
	} );

	it( 'Should keep the Regenerate button enabled less than 5 attempts', async () => {
		const { getByRole } = render( <App /> );
		await sleep( 1000 );
		await addPromptAndGenerate( 'Test:How are you doing?' );
		await waitForNextTick();
		await sleep( 1000 );

		for ( let i = 0; i < REGENERATE_ATTEMPTS_INCLUDING_FIRST_GENERATE - 1; i++ ) {
			fireEvent.click( screen.getByText( /^regenerate/i ) );
			await sleep( 100 );
		}

		const button = await getByRole( 'button', { name: /regenerate/i, hidden: true } );
		expect( button.className ).not.toContain( 'Mui-disabled' );
	} );

	it( 'Should make the Regenerate button disabled after 5 attempts', async () => {
		const { getByRole } = render( <App /> );
		await sleep( 1000 );
		await addPromptAndGenerate( 'Test: How are you doing?' );
		await waitForNextTick();
		await sleep( 1000 );

		for ( let i = 0; i < REGENERATE_ATTEMPTS_INCLUDING_FIRST_GENERATE; i++ ) {
			fireEvent.click( screen.getByText( /^regenerate/i ) );
			await sleep( 100 );
		}

		const button = await getByRole( 'button', { name: /regenerate/i, hidden: true } );
		expect( button.className ).toContain( 'Mui-disabled' );
	} );

	const onData = () => {
		return SCREENSHOT_LIGHT_1;
	};
	const onGenerate = jest.fn();
	const App = () => ( <TestThemeProvider>
		<LayoutApp
			onClose={ () => {
			} }
			onConnect={ () => {
			} }
			onData={ onData }
			onInsert={ () => {
			} }
			onSelect={ () => {
			} }
			onGenerate={ onGenerate }
			mode={ 'layout' }
			attachmentsTypes={ {} }
			hasPro={ true }
		/>
	</TestThemeProvider> );

	const renderElement = () => {
		const props = {
			DialogHeaderProps: {}, DialogContentProps: {}, attachments: [],
		};

		return render( <TestThemeProvider>
			<RequestIdsProvider>
				<RemoteConfigProvider onError={ () => {
				} }>
					<ConfigProvider mode={ 'layout' }
						attachmentsTypes={ {} }
						onClose={ () => {
						} }
						onConnect={ () => {
						} }
						onData={ () => {
						} }
						onInsert={ () => {
						} }
						onSelect={ () => {
						} }
						onGenerate={ () => {
						} }>
						<FormLayout { ...props } />
					</ConfigProvider>
				</RemoteConfigProvider>
			</RequestIdsProvider>
		</TestThemeProvider> );
	};
} );
