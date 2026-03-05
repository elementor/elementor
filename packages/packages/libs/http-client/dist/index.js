'use strict';
const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __export = (target, all) => {
	for (const name in all) {
		__defProp(target, name, { get: all[name], enumerable: true });
	}
};
const __copyProps = (to, from, except, desc) => {
	if ((from && typeof from === 'object') || typeof from === 'function') {
		for (const key of __getOwnPropNames(from)) {
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: () => from[key],
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
				});
			}
		}
	}
	return to;
};
const __toESM = (mod, isNodeMode, target) => (
	(target = mod != null ? __create(__getProtoOf(mod)) : {}),
	__copyProps(
		// If the importer is in node compatibility mode or this is not an ESM
		// file that has been converted to a CommonJS file using a Babel-
		// compatible transform (i.e. "__esModule" has not been set), then set
		// "default" to the CommonJS "module.exports" for node compatibility.
		isNodeMode || !mod || !mod.__esModule ? __defProp(target, 'default', { value: mod, enumerable: true }) : target,
		mod
	)
);
const __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// src/index.ts
const index_exports = {};
__export(index_exports, {
	AxiosError: () => import_axios2.AxiosError,
	httpService: () => httpService,
});
module.exports = __toCommonJS(index_exports);
var import_axios2 = require('axios');

// src/http.ts
const import_axios = __toESM(require('axios'));

// src/env.ts
const import_env = require('@elementor/env');
const { env } = (0, import_env.parseEnv)('@elementor/http-client');

// src/http.ts
let instance;
var httpService = () => {
	if (!instance) {
		instance = import_axios.default.create({
			baseURL: env.base_url,
			timeout: 1e4,
			headers: {
				'Content-Type': 'application/json',
				...env.headers,
			},
		});
	}
	return instance;
};
// Annotate the CommonJS export names for ESM import in node:
0 &&
	(module.exports = {
		AxiosError,
		httpService,
	});
//# sourceMappingURL=index.js.map
