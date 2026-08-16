import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { hash } from '@elementor/utils';

import { type AllowedHtmlTag } from './allowed-tags';
import { apiClient } from './api';
import { selectData, selectInitialData, selectIsDirty, slice, type StateWithDefaultStyles } from './store';

function getChangedTags(state: StateWithDefaultStyles): AllowedHtmlTag[] {
	const current = selectData(state);
	const initial = selectInitialData(state);

	const changed: AllowedHtmlTag[] = [];

	Object.keys(current).forEach((tag) => {
		const currentStyle = current[tag];
		const initialStyle = initial[tag];

		if (!initialStyle || hash(currentStyle) !== hash(initialStyle)) {
			changed.push(tag as AllowedHtmlTag);
		}
	});

	Object.keys(initial).forEach((tag) => {
		if (!current[tag]) {
			changed.push(tag as AllowedHtmlTag);
		}
	});

	return changed;
}

export async function saveDefaultStyles() {
	const state = getState() as StateWithDefaultStyles;

	if (!selectIsDirty(state)) {
		return;
	}

	const data = selectData(state);
	const changedTags = getChangedTags(state);

	await Promise.all(
		changedTags.map(async (tag) => {
			const style = data[tag];

			if (!style || style.variants.length === 0) {
				await apiClient.delete(tag);

				return;
			}

			await apiClient.put(tag, style.variants);
		})
	);

	dispatch(slice.actions.commit());
}
