import * as React from 'react';
import { useState } from 'react';

interface MenuOptions {
	title?: string;
}
interface MenuActionOptions extends MenuOptions {
	onClick?: () => void;
}

export function createMockMenuAction( { onClick = () => null, title = 'Test' }: MenuActionOptions = {} ) {
	return {
		id: 'test',
		props: {
			title,
			icon: () => <span>a</span>,
			onClick,
		},
	};
}

export function createMockMenuToggleAction( { title = 'Test' }: MenuOptions = {} ) {
	return {
		id: 'test',
		useProps: () => {
			const [ selected, setSelected ] = useState( false );
			const [ clicks, setClicks ] = useState( 0 );

			return {
				title,
				icon: () => <span>a</span>,
				selected,
				onClick: () => {
					setSelected( ( prev ) => ! prev );
					setClicks( ( prev ) => prev + 1 );
				},
				value: 'test-value',
				disabled: clicks > 1,
			};
		},
	};
}

export function createMockMenuLink( { title = 'Test' }: MenuOptions = {} ) {
	return {
		id: 'test',
		props: {
			title,
			icon: () => <span>a</span>,
			href: 'https://elementor.com',
			target: '_blank',
		},
	};
}
