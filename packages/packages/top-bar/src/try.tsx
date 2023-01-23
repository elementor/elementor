import { useState } from 'react';
import {
	injectIntoMainMenu,
	injectIntoToolsMenu,
	injectIntoUtilitiesMenu,
	TopBarAction,
	TopBarDivider,
	TopBarToggleAction,
} from '@elementor/top-bar';
import { SvgIcon } from '@elementor/ui';

const ExampleLink = () => {
	return (
		<TopBarAction
			title="Link"
			icon={ () => (
				<SvgIcon viewBox="0 0 24 24">
					<path d="M11 4.75C11 4.33579 11.3358 4 11.75 4C12.1642 4 12.5 4.33579 12.5 4.75V11H18.75C19.1642 11 19.5 11.3358 19.5 11.75C19.5 12.1642 19.1642 12.5 18.75 12.5H12.5V18.75C12.5 19.1642 12.1642 19.5 11.75 19.5C11.3358 19.5 11 19.1642 11 18.75V12.5H4.75C4.33579 12.5 4 12.1642 4 11.75C4 11.3358 4.33579 11 4.75 11H11V4.75Z" />
				</SvgIcon>
			) }
			href={ 'https://elementor.com' }
			target="_blank"
		/>
	);
};

const ExampleToggleButton = () => {
	const [ isActive, setIsActive ] = useState( false );

	return (
		<TopBarToggleAction
			title="Toggle Button"
			icon={ () => (
				<SvgIcon viewBox="0 0 24 24">
					<path d="M11 4.75C11 4.33579 11.3358 4 11.75 4C12.1642 4 12.5 4.33579 12.5 4.75V11H18.75C19.1642 11 19.5 11.3358 19.5 11.75C19.5 12.1642 19.1642 12.5 18.75 12.5H12.5V18.75C12.5 19.1642 12.1642 19.5 11.75 19.5C11.3358 19.5 11 19.1642 11 18.75V12.5H4.75C4.33579 12.5 4 12.1642 4 11.75C4 11.3358 4.33579 11 4.75 11H11V4.75Z" />
				</SvgIcon>
			) }
			selected={ isActive }
			onClick={ () => setIsActive( ! isActive ) }
		/>
	);
};

const ExampleDivider = () => {
	return <TopBarDivider />;
};

const ExampleButton = () => {
	return (
		<TopBarAction
			title="Button"
			icon={ () => (
				<SvgIcon viewBox="0 0 24 24">
					<path d="M11 4.75C11 4.33579 11.3358 4 11.75 4C12.1642 4 12.5 4.33579 12.5 4.75V11H18.75C19.1642 11 19.5 11.3358 19.5 11.75C19.5 12.1642 19.1642 12.5 18.75 12.5H12.5V18.75C12.5 19.1642 12.1642 19.5 11.75 19.5C11.3358 19.5 11 19.1642 11 18.75V12.5H4.75C4.33579 12.5 4 12.1642 4 11.75C4 11.3358 4.33579 11 4.75 11H11V4.75Z" />
				</SvgIcon>
			) }
			onClick={ () => alert( 'Button Clicked' ) }
		/>
	);
};

// Main menu
injectIntoMainMenu( ExampleLink, {
	priority: 10,
} );

injectIntoMainMenu( ExampleToggleButton, {
	priority: 20,
} );

injectIntoMainMenu( ExampleDivider, {
	priority: 25,
} );

injectIntoMainMenu( ExampleButton, {
	priority: 30,
} );

// Tools
injectIntoToolsMenu( ExampleLink, {
	priority: 10,
} );

injectIntoToolsMenu( ExampleToggleButton, {
	priority: 20,
} );

injectIntoToolsMenu( ExampleDivider, {
	priority: 30,
} );

injectIntoToolsMenu( ExampleButton, {
	priority: 40,
} );

injectIntoToolsMenu( ExampleButton, {
	priority: 50,
} );

injectIntoToolsMenu( ExampleButton, {
	priority: 60,
} );

injectIntoToolsMenu( ExampleToggleButton, {
	priority: 70,
} );

// Utils
injectIntoUtilitiesMenu( ExampleButton, {
	priority: 5,
} );

injectIntoUtilitiesMenu( ExampleLink, {
	priority: 6,
} );
