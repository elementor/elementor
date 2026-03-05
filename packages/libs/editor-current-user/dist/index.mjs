// src/use-current-user.ts
import { useQuery } from "@elementor/query";

// src/api.ts
import { httpService } from "@elementor/http-client";
var RESOURCE_URL = "elementor/v1/user-data/current-user";
var getUserPayload = { params: { context: "edit" } };
var apiClient = {
  get: () => httpService().get(RESOURCE_URL, getUserPayload).then((res) => {
    const { capabilities = [], suppressedMessages = [] } = res.data;
    return { capabilities, suppressedMessages };
  }),
  update: (data) => httpService().patch(RESOURCE_URL, {
    suppressedMessages: data.suppressedMessages
  })
};

// src/use-current-user.ts
var EDITOR_CURRENT_USER_QUERY_KEY = "editor-current-user";
var useCurrentUser = () => useQuery({
  queryKey: [EDITOR_CURRENT_USER_QUERY_KEY],
  queryFn: apiClient.get
});

// src/use-update-current-user.ts
import { useMutation, useQueryClient } from "@elementor/query";
var useUpdateCurrentUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
var ADMIN_CAPABILITY = "manage_options";
var useCurrentUserCapabilities = () => {
  const { data } = useCurrentUser();
  const canUser = (capability) => {
    return Boolean(data?.capabilities.includes(capability));
  };
  const isAdmin = Boolean(data?.capabilities.includes(ADMIN_CAPABILITY));
  return { canUser, isAdmin, capabilities: data?.capabilities };
};

// src/get-current-user.ts
import { getQueryClient } from "@elementor/query";
var getCurrentUser = () => {
  const queryClient = getQueryClient();
  return queryClient.getQueryData([EDITOR_CURRENT_USER_QUERY_KEY]);
};

// src/ensure-current-user.ts
import { getQueryClient as getQueryClient2 } from "@elementor/query";
async function ensureUser() {
  const queryClient = getQueryClient2();
  return queryClient.ensureQueryData({
    queryKey: [EDITOR_CURRENT_USER_QUERY_KEY],
    queryFn: apiClient.get,
    retry: false
  });
}

// src/on-set-user.ts
import { __privateListenTo as listenTo, v1ReadyEvent } from "@elementor/editor-v1-adapters";
import { getQueryClient as getQueryClient3 } from "@elementor/query";
function onSetUser(callback) {
  let unsubscribeQuery;
  const unsubscribeListener = listenTo(v1ReadyEvent(), () => {
    const queryClient = getQueryClient3();
    unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey.includes(EDITOR_CURRENT_USER_QUERY_KEY)) {
        callback(event.query.state.data);
      }
    });
  });
  return () => {
    unsubscribeQuery();
    unsubscribeListener();
  };
}
export {
  ensureUser,
  getCurrentUser,
  onSetUser,
  useCurrentUser,
  useCurrentUserCapabilities,
  useSuppressedMessage,
  useUpdateCurrentUser
};
//# sourceMappingURL=index.mjs.map