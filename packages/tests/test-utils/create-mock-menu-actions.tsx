import { useState } from 'react';

type MenuActionOptions = {
	onClick?: () => void;
}

export function createMockMenuAction( { onClick = () => null }: MenuActionOptions = {} ) {
	return {
		name: 'test',
		props: {
			title: 'Test',
			icon: () => <span>a</span>,
			onClick,
		},
	};
}

export function createMockMenuToggleAction() {
	return {
		name: 'test',
		useProps: () => {
			const [ selected, setSelected ] = useState( false );
			const [ clicks, setClicks ] = useState( 0 );

			return {
				title: 'Test',
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

export function createMockMenuLink() {
	return {
		name: 'test',
		props: {
			title: 'Test',
			icon: () => <span>a</span>,
			href: 'https://elementor.com',
			target: '_blank',
		},
	};
}
