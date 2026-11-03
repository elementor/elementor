import {
  PRO_SETUP_CONNECT_RELOAD_QUERY_PARAM,
  PRO_SETUP_OPEN_CONNECT_QUERY_PARAM,
} from './pro-setup-query-params';

type ProSetupPromotionLike =
  | {
      state?: string;
      connectUrl?: string;
    }
  | null
  | undefined;

type CompleteSetupLike = {
  reload?: boolean;
  proSetupPromotion?: ProSetupPromotionLike;
};

export { PRO_SETUP_OPEN_CONNECT_QUERY_PARAM };

export function isConnectPromotionMissingUrl( config: ProSetupPromotionLike ): boolean {
  return 'connect' === config?.state && ! config?.connectUrl;
}

export function shouldReloadEditorAfterSetupStep( result: CompleteSetupLike ): boolean {
  if ( result.reload ) {
    return true;
  }

  return isConnectPromotionMissingUrl( result.proSetupPromotion );
}

export type ReloadEditorForSetupRefreshOptions = {
  openConnectPopover?: boolean;
};

export function appendSetupRefreshQueryParams(
  url: URL,
  options: ReloadEditorForSetupRefreshOptions = {}
): void {
  url.searchParams.set( PRO_SETUP_CONNECT_RELOAD_QUERY_PARAM, String( Date.now() ) );

  if ( options.openConnectPopover ) {
    url.searchParams.set( PRO_SETUP_OPEN_CONNECT_QUERY_PARAM, '1' );
  }
}
