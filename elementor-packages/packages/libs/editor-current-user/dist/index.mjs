// src/components/prefetch-user-data.tsx
import { useQueryClient } from "@elementor/query";

// src/api.ts
import { httpService } from "@elementor/http-client";
var RESOURCE_URL = "/users/me";
var getUserPayload = { params: { context: "edit" } };
var apiClient = {
  get: () => httpService().get("wp/v2" + RESOURCE_URL, getUserPayload).then((res) => {
    return responseToUser(res.data);
  }),
  update: (data) => httpService().patch("wp/v2" + RESOURCE_URL, userToRequest(data))
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
import { useQuery } from "@elementor/query";

// src/get-current-user.ts
var getCurrentUser = () => {
  return apiClient.get();
};

// src/use-current-user.ts
var EDITOR_CURRENT_USER_QUERY_KEY = "editor-current-user";
var useCurrentUser = () => useQuery({
  queryKey: [EDITOR_CURRENT_USER_QUERY_KEY],
  queryFn: getCurrentUser
});

// src/components/prefetch-user-data.tsx
function PrefetchUserData() {
  const queryClient = useQueryClient();
  queryClient.prefetchQuery({
    queryKey: [EDITOR_CURRENT_USER_QUERY_KEY],
    queryFn: apiClient.get
  });
  return null;
}

// src/use-update-current-user.ts
import { useMutation, useQueryClient as useQueryClient2 } from "@elementor/query";
var useUpdateCurrentUser = () => {
  const queryClient = useQueryClient2();
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
var useCurrentUserCapabilities = () => {
  const { data } = useCurrentUser();
  const canUser = (capability) => {
    return Boolean(data?.capabilities.includes(capability));
  };
  return { canUser, capabilities: data?.capabilities };
};
export {
  PrefetchUserData,
  getCurrentUser,
  useCurrentUserCapabilities,
  useSuppressedMessage
};
//# sourceMappingURL=index.mjs.map