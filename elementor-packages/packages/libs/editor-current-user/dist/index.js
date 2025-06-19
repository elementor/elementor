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
  PrefetchUserData: () => PrefetchUserData,
  getCurrentUser: () => getCurrentUser,
  useCurrentUserCapabilities: () => useCurrentUserCapabilities,
  useSuppressedMessage: () => useSuppressedMessage
});
module.exports = __toCommonJS(index_exports);

// src/components/prefetch-user-data.tsx
var import_query2 = require("@elementor/query");

// src/api.ts
var import_http_client = require("@elementor/http-client");
var RESOURCE_URL = "/users/me";
var getUserPayload = { params: { context: "edit" } };
var apiClient = {
  get: () => (0, import_http_client.httpService)().get("wp/v2" + RESOURCE_URL, getUserPayload).then((res) => {
    return responseToUser(res.data);
  }),
  update: (data) => (0, import_http_client.httpService)().patch("wp/v2" + RESOURCE_URL, userToRequest(data))
};
var responseToUser = (response) => {
  return {
    suppressedMessages: Object.entries(response.elementor_introduction).filter(([, value]) => value).map(([message]) => message),
    capabilities: Object.keys(response.capabilities)
  };
};
var userToRequest = (user) => {
  return {
    elementor_introduction: user.suppressedMessages?.reduce(
      (acc, message) => {
        acc[message] = true;
        return acc;
      },
      {}
    )
  };
};

// src/use-current-user.ts
var import_query = require("@elementor/query");

// src/get-current-user.ts
var getCurrentUser = () => {
  return apiClient.get();
};

// src/use-current-user.ts
var EDITOR_CURRENT_USER_QUERY_KEY = "editor-current-user";
var useCurrentUser = () => (0, import_query.useQuery)({
  queryKey: [EDITOR_CURRENT_USER_QUERY_KEY],
  queryFn: getCurrentUser
});

// src/components/prefetch-user-data.tsx
function PrefetchUserData() {
  const queryClient = (0, import_query2.useQueryClient)();
  queryClient.prefetchQuery({
    queryKey: [EDITOR_CURRENT_USER_QUERY_KEY],
    queryFn: apiClient.get
  });
  return null;
}

// src/use-update-current-user.ts
var import_query3 = require("@elementor/query");
var useUpdateCurrentUser = () => {
  const queryClient = (0, import_query3.useQueryClient)();
  return (0, import_query3.useMutation)({
    mutationFn: apiClient.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EDITOR_CURRENT_USER_QUERY_KEY] })
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
        suppressedMessages: [...data?.suppressedMessages ?? [], messageKey]
      });
    }
  };
  return [isMessageSuppressed, suppressMessage];
};

// src/use-current-user-capabilities.ts
var useCurrentUserCapabilities = () => {
  const { data } = useCurrentUser();
  const canUser = (capability) => {
    return Boolean(data?.capabilities.includes(capability));
  };
  return { canUser, capabilities: data?.capabilities };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PrefetchUserData,
  getCurrentUser,
  useCurrentUserCapabilities,
  useSuppressedMessage
});
//# sourceMappingURL=index.js.map