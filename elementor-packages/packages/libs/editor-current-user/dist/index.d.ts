declare function PrefetchUserData(): null;

declare const useSuppressedMessage: (messageKey: string) => readonly [boolean, () => void];

declare const useCurrentUserCapabilities: () => {
    canUser: (capability: string) => boolean;
    capabilities: string[] | undefined;
};

type User = {
    suppressedMessages: string[];
    capabilities: string[];
};

declare const getCurrentUser: () => Promise<User>;

export { PrefetchUserData, getCurrentUser, useCurrentUserCapabilities, useSuppressedMessage };
