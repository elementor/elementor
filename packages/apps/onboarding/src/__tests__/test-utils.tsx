import * as React from 'react';
import { __deleteStore } from '@elementor/store';
import { QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';

import { App } from '../components/app';
import { DEFAULT_STRINGS } from '../utils/default-strings';

jest.mock( '@elementor/query', () => {
  const actual = jest.requireActual( '@elementor/query' );
  return {
    ...actual,
    createQueryClient: () =>
      new QueryClient( {
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
        },
      } ),
  };
} );

export const mockFetch = jest.fn();
global.fetch = mockFetch;

interface OnboardingConfig {
  version: string;
  restUrl: string;
  nonce: string;
  steps: Array< {
    id: string;
    label: string;
    type: 'single' | 'multiple';
  } >;
  progress: {
    current_step_id?: string;
    current_step_index?: number;
    completed_steps?: string[];
  };
  choices: Record< string, unknown >;
  hadUnexpectedExit: boolean;
  isConnected: boolean;
  shouldShowProInstallScreen?: boolean;
  isHelloThemeActive?: boolean;
  userName?: string;
  translations?: Record< string, string >;
  urls: {
    dashboard: string;
    editor: string;
    connect: string;
    signUp: string;
    comparePlans?: string;
    upgradeUrl: string;
  };
}

const DEFAULT_STEPS = [
  { id: 'site_features', label: 'Site features', type: 'multiple' as const },
];

export const PRO_ONBOARDING_STEPS = [
  { id: 'theme_selection', label: 'Theme selection', type: 'single' as const },
];

export const DEFAULT_TEST_URLS = {
  comparePlans: 'https://elementor.com/pricing/?utm_source=onboarding&utm_medium=wp-dash',
  upgradeUrl:
    'https://elementor.com/pro/?utm_source=onboarding-wizard&utm_campaign=gopro&utm_medium=wp-dash&utm_content=top-bar&utm_term=2.0.0',
} as const;

const defaultConfig: OnboardingConfig = {
  version: '2.0.0',
  restUrl: 'https://test.local/wp-json/elementor/v1/onboarding/',
  nonce: 'test-nonce',
  steps: DEFAULT_STEPS,
  translations: DEFAULT_STRINGS,
  progress: {
    current_step_id: 'site_features',
    current_step_index: 0,
    completed_steps: [],
  },
  choices: {},
  hadUnexpectedExit: false,
  isConnected: true,
  shouldShowProInstallScreen: false,
  urls: {
    dashboard: 'https://test.local/wp-admin/',
    editor: 'https://test.local/editor',
    connect: 'https://test.local/connect',
    signUp: 'https://test.local/connect?screen_hint=signup',
    ...DEFAULT_TEST_URLS,
  },
};

type ConfigOverrides = Partial< OnboardingConfig >;

export const createMockConfig = (
  overrides: ConfigOverrides = {}
): { onboarding: OnboardingConfig } => ( {
  onboarding: {
    ...defaultConfig,
    ...overrides,
    progress: {
      ...defaultConfig.progress,
      ...overrides.progress,
    },
  },
} );

export function setupOnboardingTests() {
  beforeEach( () => {
    __deleteStore();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue( {
      ok: true,
      json: () => Promise.resolve( { success: true } ),
    } );
  } );

  afterEach( () => {
    window.elementorAppConfig = undefined;
    __deleteStore();
  } );
}

export function renderApp( overrides: ConfigOverrides = {} ) {
  window.elementorAppConfig = createMockConfig( overrides );
  return render( <App /> );
}
