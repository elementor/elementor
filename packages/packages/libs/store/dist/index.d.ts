import * as _reduxjs_toolkit_dist_configureStore from '@reduxjs/toolkit/dist/configureStore';
import * as redux from 'redux';
import { Slice, Middleware, EnhancedStore, AnyAction, ThunkMiddleware, StoreEnhancer } from '@reduxjs/toolkit';
export { Action, AnyAction, CreateSliceOptions, Dispatch, Middleware, MiddlewareAPI, PayloadAction, Slice, Store, createAction as __createAction, createAsyncThunk as __createAsyncThunk, createSelector as __createSelector, createSlice as __createSlice } from '@reduxjs/toolkit';
export { Provider as __StoreProvider, useDispatch as __useDispatch, useSelector as __useSelector } from 'react-redux';

/**
 * Usage:
 *
 * const mySlice = addSlice( ... );
 *
 * type MySliceState = SliceState<typeof mySlice>;
 *
 * const value = useSelector( ( state: MySliceState ) => state.mySlice.value );
 */
type SliceState<S extends Slice> = {
    [key in S['name']]: ReturnType<S['getInitialState']>;
};
type AnyStore<State = any> = EnhancedStore<State, AnyAction, [
    ThunkMiddleware<State, AnyAction>
], [
    StoreEnhancer
]>;
declare function registerSlice(slice: Slice): void;
declare const addMiddleware: (middleware: Middleware) => void;
declare const dispatch: (action: any) => any;
declare const getState: () => any;
declare const subscribe: (listener: () => void) => redux.Unsubscribe;
declare const subscribeWithSelector: <T>(selector: (state: any) => T, listener: (selectedState: T) => void) => redux.Unsubscribe;
declare const createStore: () => AnyStore;
declare const getStore: () => _reduxjs_toolkit_dist_configureStore.ToolkitStore<any, AnyAction, [ThunkMiddleware<any, AnyAction>]> | null;
declare const deleteStore: () => void;

export { type SliceState, addMiddleware as __addMiddleware, createStore as __createStore, deleteStore as __deleteStore, dispatch as __dispatch, getState as __getState, getStore as __getStore, registerSlice as __registerSlice, subscribe as __subscribe, subscribeWithSelector as __subscribeWithSelector };
