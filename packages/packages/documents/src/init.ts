import { syncStore } from './sync';
import { createSlice } from './store';

export default function init() {
	initStore();
}

function initStore() {
	const slice = createSlice();

	syncStore( slice );
}
