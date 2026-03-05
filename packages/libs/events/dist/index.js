'use strict';
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
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
const __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// src/index.ts
const index_exports = {};
__export(index_exports, {
	getMixpanel: () => getMixpanel,
	trackEvent: () => trackEvent,
	useMixpanel: () => useMixpanel,
});
module.exports = __toCommonJS(index_exports);

// src/use-mixpanel.ts
var useMixpanel = () => {
	const { dispatchEvent, config } = getMixpanel();
	return {
		dispatchEvent,
		config,
	};
};
var trackEvent = (event) => {
	const { dispatchEvent } = getMixpanel();
	dispatchEvent?.(event.eventName, event);
};
var getMixpanel = () => {
	const eventsManager = window.elementorCommon?.eventsManager || {};
	return {
		dispatchEvent: eventsManager.dispatchEvent?.bind(eventsManager),
		config: eventsManager.config,
	};
};
// Annotate the CommonJS export names for ESM import in node:
0 &&
	(module.exports = {
		getMixpanel,
		trackEvent,
		useMixpanel,
	});
//# sourceMappingURL=index.js.map
