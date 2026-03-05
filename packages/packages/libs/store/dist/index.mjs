// src/index.ts
import {
  combineReducers,
  configureStore
} from "@reduxjs/toolkit";
import {
  createSelector,
  createSlice,
  createAsyncThunk,
  createAction
} from "@reduxjs/toolkit";
import { useSelector, useDispatch, Provider } from "react-redux";
var instance = null;
var slices = {};
var pendingActions = [];
var middlewares = /* @__PURE__ */ new Set();
var getReducers = () => {
  const reducers = Object.entries(slices).reduce((reducersData, [name, slice]) => {
    reducersData[name] = slice.reducer;
    return reducersData;
  }, {});
  return combineReducers(reducers);
};
function registerSlice(slice) {
  if (slices[slice.name]) {
    throw new Error(`Slice with name "${slice.name}" already exists.`);
  }
  slices[slice.name] = slice;
}
var addMiddleware = (middleware) => {
  middlewares.add(middleware);
};
var dispatch = (action) => {
  if (!instance) {
    pendingActions.push(action);
    return;
  }
  return instance.dispatch(action);
};
var getState = () => {
  if (!instance) {
    throw new Error("The store instance does not exist.");
  }
  return instance.getState();
};
var subscribe = (listener) => {
  if (!instance) {
    throw new Error("The store instance does not exist.");
  }
  return instance.subscribe(listener);
};
var subscribeWithSelector = (selector, listener) => {
  let prevState = selector(getState());
  return subscribe(() => {
    const nextState = selector(getState());
    if (prevState === nextState) {
      return;
    }
    prevState = nextState;
    listener(nextState);
  });
};
var createStore = () => {
  if (instance) {
    throw new Error("The store instance already exists.");
  }
  instance = configureStore({
    reducer: getReducers(),
    middleware: (getDefaultMiddleware) => {
      return [...getDefaultMiddleware(), ...Array.from(middlewares)];
    }
  });
  if (pendingActions.length) {
    pendingActions.forEach((action) => dispatch(action));
    pendingActions.length = 0;
  }
  return instance;
};
var getStore = () => {
  return instance;
};
var deleteStore = () => {
  instance = null;
  slices = {};
  pendingActions.length = 0;
  middlewares.clear();
};
export {
  Provider as __StoreProvider,
  addMiddleware as __addMiddleware,
  createAction as __createAction,
  createAsyncThunk as __createAsyncThunk,
  createSelector as __createSelector,
  createSlice as __createSlice,
  createStore as __createStore,
  deleteStore as __deleteStore,
  dispatch as __dispatch,
  getState as __getState,
  getStore as __getStore,
  registerSlice as __registerSlice,
  subscribe as __subscribe,
  subscribeWithSelector as __subscribeWithSelector,
  useDispatch as __useDispatch,
  useSelector as __useSelector
};
//# sourceMappingURL=index.mjs.map