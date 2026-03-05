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
	ensureUser: () => ensureUser,
	getCurrentUser: () => getCurrentUser,
	onSetUser: () => onSetUser,
	useCurrentUser: () => useCurrentUser,
	useCurrentUserCapabilities: () => useCurrentUserCapabilities,
	useSuppressedMessage: () => useSuppressedMessage,
	useUpdateCurrentUser: () => useUpdateCurrentUser,
});
module.exports = __toCommonJS(index_exports);

// src/use-current-user.ts
const import_query = require('@elementor/query');

// src/api.ts
const import_http_client = require('@elementor/http-client');
const RESOURCE_URL = 'elementor/v1/user-data/current-user';
const getUserPayload = { params: { context: 'edit' } };
const apiClient = {
	get: () =>
		(0, import_http_client.httpService)()
			.get(RESOURCE_URL, getUserPayload)
			.then((res) => {
				const { capabilities = [], suppressedMessages = [] } = res.data;
				return { capabilities, suppressedMessages };
			}),
	update: (data) =>
		(0, import_http_client.httpService)().patch(RESOURCE_URL, {
			suppressedMessages: data.suppressedMessages,
		}),
};

// src/use-current-user.ts
const EDITOR_CURRENT_USER_QUERY_KEY = 'editor-current-user';
var useCurrentUser = () =>
	(0, import_query.useQuery)({
		queryKey: [EDITOR_CURRENT_USER_QUERY_KEY],
		queryFn: apiClient.get,
	});

// src/use-update-current-user.ts
const import_query2 = require('@elementor/query');
var useUpdateCurrentUser = () => {
	const queryClient = (0, import_query2.useQueryClient)();
	return (0, import_query2.useMutation)({
		mutationFn: apiClient.update,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [EDITOR_CURRENT_USER_QUERY_KEY] }),
	});
};

// src/use-suppressed-message.ts
var useSuppressedMessage = (messageKey) => {
	const { data } = useCurrentUser();
	const { mutate } = useUpdateCurrentUser();
	const isMessageSuppressed = !!data?.suppressedMessages.includes(messageKey);
	const suppressMessage = () => {
		if (!isMessageSuppressed) {
			mutate({
				suppressedMessages: [...(data?.suppressedMessages ?? []), messageKey],
			});
		}
	};
	return [isMessageSuppressed, suppressMessage];
};

// src/use-current-user-capabilities.ts
const ADMIN_CAPABILITY = 'manage_options';
var useCurrentUserCapabilities = () => {
	const { data } = useCurrentUser();
	const canUser = (capability) => {
		return Boolean(data?.capabilities.includes(capability));
	};
	const isAdmin = Boolean(data?.capabilities.includes(ADMIN_CAPABILITY));
	return { canUser, isAdmin, capabilities: data?.capabilities };
};

// src/get-current-user.ts
const import_query3 = require('@elementor/query');
var getCurrentUser = () => {
	const queryClient = (0, import_query3.getQueryClient)();
	return queryClient.getQueryData([EDITOR_CURRENT_USER_QUERY_KEY]);
};

// src/ensure-current-user.ts
const import_query4 = require('@elementor/query');
async function ensureUser() {
	const queryClient = (0, import_query4.getQueryClient)();
	return queryClient.ensureQueryData({
		queryKey: [EDITOR_CURRENT_USER_QUERY_KEY],
		queryFn: apiClient.get,
		retry: false,
	});
}

// src/on-set-user.ts
const import_editor_v1_adapters = require('@elementor/editor-v1-adapters');
const import_query5 = require('@elementor/query');
function onSetUser(callback) {
	let unsubscribeQuery;
	const unsubscribeListener = (0, import_editor_v1_adapters.__privateListenTo)(
		(0, import_editor_v1_adapters.v1ReadyEvent)(),
		() => {
			const queryClient = (0, import_query5.getQueryClient)();
			unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
				if (event.query.queryKey.includes(EDITOR_CURRENT_USER_QUERY_KEY)) {
					callback(event.query.state.data);
				}
			});
		}
	);
	return () => {
		unsubscribeQuery();
		unsubscribeListener();
	};
}
// Annotate the CommonJS export names for ESM import in node:
0 &&
	(module.exports = {
		ensureUser,
		getCurrentUser,
		onSetUser,
		useCurrentUser,
		useCurrentUserCapabilities,
		useSuppressedMessage,
		useUpdateCurrentUser,
	});
//# sourceMappingURL=index.js.map
