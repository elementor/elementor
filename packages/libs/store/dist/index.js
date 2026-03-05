"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  __StoreProvider: () => import_react_redux.Provider,
  __addMiddleware: () => addMiddleware,
  __createAction: () => import_toolkit2.createAction,
  __createAsyncThunk: () => import_toolkit2.createAsyncThunk,
  __createSelector: () => import_toolkit2.createSelector,
  __createSlice: () => import_toolkit2.createSlice,
  __createStore: () => createStore,
  __deleteStore: () => deleteStore,
  __dispatch: () => dispatch,
  __getState: () => getState,
  __getStore: () => getStore,
  __registerSlice: () => registerSlice,
  __subscribe: () => subscribe,
  __subscribeWithSelector: () => subscribeWithSelector,
  __useDispatch: () => import_react_redux.useDispatch,
  __useSelector: () => import_react_redux.useSelector
});
module.exports = __toCommonJS(index_exports);
var import_toolkit = require("@reduxjs/toolkit");
var import_toolkit2 = require("@reduxjs/toolkit");
var import_react_redux = require("react-redux");
var instance = null;
var slices = {};
var pendingActions = [];
var middlewares = /* @__PURE__ */ new Set();
var getReducers = () => {
  const reducers = Object.entries(slices).reduce((reducersData, [name, slice]) => {
    reducersData[name] = slice.reducer;
    return reducersData;
  }, {});
  return (0, import_toolkit.combineReducers)(reducers);
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
  instance = (0, import_toolkit.configureStore)({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  __StoreProvider,
  __addMiddleware,
  __createAction,
  __createAsyncThunk,
  __createSelector,
  __createSlice,
  __createStore,
  __deleteStore,
  __dispatch,
  __getState,
  __getStore,
  __registerSlice,
  __subscribe,
  __subscribeWithSelector,
  __useDispatch,
  __useSelector
});
//# sourceMappingURL=index.js.map