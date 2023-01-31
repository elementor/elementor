import { createSlice } from './store';
import { syncStore } from './sync';

const slice = createSlice();

syncStore( slice );
