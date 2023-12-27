import FormLayout from 'elementor/modules/ai/assets/js/editor/pages/form-layout';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
	ConfigProvider,
} from 'elementor/modules/ai/assets/js/editor/pages/form-layout/context/config';
import TestThemeProvider from '../../mock/test-theme-provider';
import { addPromptAndGenerate, mockEditorEnvironment, sleep } from '../../test-utils';
import {
	RemoteConfigProvider,
} from 'elementor/modules/ai/assets/js/editor/pages/form-layout/context/remote-config';

describe( 'FormLayout', () => {
	beforeEach( async () => {
		mockEditorEnvironment();
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

		const root = getByTestId( 'root' );

		expect( root.querySelector( 'iframe' ) ).toBeNull();
	} );

	it( 'Should keep the Regenerate button enabled less than 5 attempts', async () => {
		const { getByTestId } = renderElement();
		const root = getByTestId( 'root' );
		await addPromptAndGenerate( 'How are you doing?' );

		for ( let i = 0; i < 4; i++ ) {
			fireEvent.click( screen.getByText( /^regenerate/i ) );
			await waitFor( () => Promise.resolve() );
			await sleep( 1000 );
		}

		expect( screen.getByText( /^regenerate/i ) ).not.toBeDisabled();
	} );

	it( 'Should make the Regenerate button disabled after 5 attempts', async () => {
		const { getByTestId } = renderElement();
		const root = getByTestId( 'root' );
		await addPromptAndGenerate( 'How are you doing?' );

		for ( let i = 0; i < 5; i++ ) {
			fireEvent.click( screen.getByText( /^regenerate/i ) );
			await waitFor( () => Promise.resolve() );
		}

		expect( screen.getByText( /^regenerate/i ) ).toBeDisabled();
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
