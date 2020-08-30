import StoreManager from './manager';

export {
	Provider,
	useDispatch,
	useSelector,
} from 'react-redux';

export { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';

export { createModule, createBasicSelectors, useModulesActions, useModulesSelectors, useModulesBoundedActions } from './utils';

export const manager = StoreManager.getInstance();
