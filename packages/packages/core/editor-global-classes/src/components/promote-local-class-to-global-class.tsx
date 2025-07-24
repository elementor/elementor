import { Button, Divider, FormHelperText, MenuItem, Stack, TextField, ThemeProvider } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

import { validateStyleLabel } from '@elementor/editor-styles-repository';
import { StyleDefinition } from '@elementor/editor-styles';
import { globalClassesStylesProvider } from '../global-classes-styles-provider';

type OwnProps = {
	successCallback: (_: string) => void;
	styleDef: StyleDefinition
}

export const PromoteLocalClassToGlobalClass = (props: OwnProps) => {
	const [newClassName, setNewClassName] = useState('');
	const ref = useRef<HTMLInputElement>();
	const localStyleData = props.styleDef;
	const { errorMessage, isValid } = validateStyleLabel(newClassName, 'create')

	const handlePromote = () => {
		if (!isValid) return;
		const newId = globalClassesStylesProvider.actions.create?.(newClassName, localStyleData.variants);
		if (newId) {
			props.successCallback(newId);
		}
	}

	const handleKeyDown = (e: KeyboardEvent) => {
		e.stopPropagation();
	}

	// The form is inside a keyboard listener, so we need to prevent wrapper's detection of keyboard events
	// The reason for usage of "form" element is to capture Enter
	useEffect(() => {
		if (!ref.current) return;
		ref.current.addEventListener('keydown', handleKeyDown);
		return () => {
			ref.current?.removeEventListener('keydown', handleKeyDown);
		}
	}, [ref.current]);

	return (
		<>
			<ThemeProvider>
			<Divider />
				<MenuItem dense sx={{
					'&.Mui-focusVisible': {
						border: 'none',
						boxShadow: 'none !important',
						backgroundColor: 'transparent',
				}
			}}>
				<form onSubmit={(e) => {
					e.preventDefault();
					handlePromote();
				}}>
					<Stack ref={ref} gap={0.5} direction="row" alignItems="center">
						<TextField
							sx={{ width: '100%' }}
							size='tiny'
							placeholder={__('Convert to global class', 'elementor')}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewClassName(e.target.value.trim())}
						/>
						<Button type="submit" disabled={!isValid}>
							{__('Convert', 'elementor')}
						</Button>
					</Stack>
					{(errorMessage && !!newClassName.length) && <FormHelperText error>{errorMessage}</FormHelperText>}
				</form>
				</MenuItem>
			</ThemeProvider>
		</>
	);
}