import { createSlice } from './store';
import { syncStore } from './sync/sync-store';

const slice = createSlice();

syncStore( slice );
