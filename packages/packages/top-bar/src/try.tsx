import { useState } from 'react';
import {
	injectIntoCanvasViewLocation,
	injectIntoMainMenuLocation,
	injectIntoToolsMenuLocation,
} from './locations';
import Action from './components/public/action';
import Divider from './components/public/divider';
import { SvgIcon, Typography } from '@elementor/ui';
import * as React from 'react';
import HorizontalMenuItem from './components/horizontal-menu-item';
import ToggleAction from './components/public/toggle-action';

const ExampleLink = () => {
	return (
		<Action
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
		<ToggleAction
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
	return <Divider />;
};

const ExampleButton = () => {
	return (
		<Action
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
injectIntoMainMenuLocation( ExampleLink, {
	priority: 10,
} );

injectIntoMainMenuLocation( ExampleToggleButton, {
	priority: 20,
} );

injectIntoMainMenuLocation( ExampleDivider, {
	priority: 25,
} );

injectIntoMainMenuLocation( ExampleButton, {
	priority: 30,
} );

// Tools
injectIntoToolsMenuLocation( ExampleLink, {
	priority: 10,
} );

injectIntoToolsMenuLocation( ExampleToggleButton, {
	priority: 20,
} );

injectIntoToolsMenuLocation( ExampleDivider, {
	priority: 30,
} );

injectIntoToolsMenuLocation( ExampleButton, {
	priority: 40,
} );

injectIntoToolsMenuLocation( ExampleButton, {
	priority: 50,
} );

injectIntoToolsMenuLocation( ExampleButton, {
	priority: 60,
} );

injectIntoToolsMenuLocation( ExampleToggleButton, {
	priority: 70,
} );

// Canvas view
injectIntoCanvasViewLocation( () => (
	<HorizontalMenuItem>
		<SvgIcon viewBox="0 0 24 24">
			<path d="M11 4.75C11 4.33579 11.3358 4 11.75 4C12.1642 4 12.5 4.33579 12.5 4.75V11H18.75C19.1642 11 19.5 11.3358 19.5 11.75C19.5 12.1642 19.1642 12.5 18.75 12.5H12.5V18.75C12.5 19.1642 12.1642 19.5 11.75 19.5C11.3358 19.5 11 19.1642 11 18.75V12.5H4.75C4.33579 12.5 4 12.1642 4 11.75C4 11.3358 4.33579 11 4.75 11H11V4.75Z" />
		</SvgIcon>
		<Typography variant="body2" sx={ { paddingInline: '6px' } }>
			Some Text here
		</Typography>
	</HorizontalMenuItem>
) );
