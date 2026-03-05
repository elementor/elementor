import * as _tanstack_react_query from '@tanstack/react-query';
import * as axios from 'axios';

declare const useSuppressedMessage: (messageKey: string) => readonly [boolean, () => void];

declare const useCurrentUserCapabilities: () => {
    canUser: (capability: string) => boolean;
    isAdmin: boolean;
    capabilities: string[] | undefined;
};

type User = {
    suppressedMessages: string[];
    capabilities: string[];
};

type UserModel = {
    suppressedMessages: string[];
    capabilities: string[];
};

declare const getCurrentUser: () => UserModel | undefined;

declare function ensureUser(): Promise<{
    capabilities: string[];
    suppressedMessages: string[];
}>;

declare function onSetUser(callback: (user: UserModel | null) => void): () => void;

declare const useCurrentUser: () => _tanstack_react_query.UseQueryResult<{
    capabilities: string[];
    suppressedMessages: string[];
}, Error>;

declare const useUpdateCurrentUser: () => _tanstack_react_query.UseMutationResult<axios.AxiosResponse<Partial<UserModel>, any, {}>, Error, Partial<User>, unknown>;

export { ensureUser, getCurrentUser, onSetUser, useCurrentUser, useCurrentUserCapabilities, useSuppressedMessage, useUpdateCurrentUser };
