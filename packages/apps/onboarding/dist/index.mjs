// src/components/app.tsx
import * as React32 from "react";
import { useEffect as useEffect5, useMemo as useMemo7 } from "react";
import { createQueryClient, QueryClientProvider } from "@elementor/query";
import { __createStore, __getStore, __StoreProvider as StoreProvider } from "@elementor/store";
import { DirectionProvider, ThemeProvider } from "@elementor/ui";

// src/store/slice.ts
import { __createSlice, __registerSlice } from "@elementor/store";

// src/types.ts
var StepId = {
  BUILDING_FOR: "building_for",
  SITE_ABOUT: "site_about",
  EXPERIENCE_LEVEL: "experience_level",
  THEME_SELECTION: "theme_selection",
  SITE_FEATURES: "site_features"
};

// src/utils/translations.ts
import { createTranslate } from "@elementor/utils";

// src/utils/default-strings.ts
var DEFAULT_STRINGS = {
  "common.continue": "Continue",
  "common.skip": "Skip",
  "common.back": "Back",
  "common.finish": "Finish",
  "common.loading": "Loading\u2026",
  "common.upgrade": "Upgrade",
  "common.close_onboarding": "Close onboarding",
  "common.installed": "Installed",
  "common.recommended": "Recommended",
  "error.failed_mark_exit": "Failed to mark user exit.",
  "error.failed_complete_step": "Failed to complete step.",
  "login.title": "Let's get to work.",
  "login.sign_in": "Sign in to Elementor",
  "login.or": "OR",
  "login.continue_another_way": "Continue another way",
  "login.continue_as_guest": "Continue as a guest",
  "steps.building_for.title": "Who are you building for?",
  "steps.building_for.greeting_with_name": "Hey %1$s %2$s Let's get your site set up.",
  "steps.building_for.greeting_without_name": "Hey%s Let's get your site set up.",
  "steps.building_for.option_myself": "Myself or someone I know",
  "steps.building_for.option_business": "My business or workplace",
  "steps.building_for.option_client": "A client",
  "steps.building_for.option_exploring": "Just exploring",
  "steps.site_about.title": "What is your site about?",
  "steps.site_about.subtitle": "Choose anything that applies.",
  "steps.site_about.option_small_med_business": "Small-Med Business",
  "steps.site_about.option_online_store": "Online store",
  "steps.site_about.option_company_site": "Company site",
  "steps.site_about.option_blog": "Blog",
  "steps.site_about.option_landing_page": "Landing page",
  "steps.site_about.option_booking": "Booking",
  "steps.site_about.option_organization": "Organization",
  "steps.site_about.option_other": "Other",
  "steps.site_about.greeting_myself": "Got it! We'll keep things simple.",
  "steps.site_about.greeting_business": "Great! Let's set up your business site.",
  "steps.site_about.greeting_client": "Nice! Let's create something for your client.",
  "steps.site_about.greeting_fallback": "Let's get started!",
  "steps.experience_level.title": "How much experience do you have with Elementor?",
  "steps.experience_level.subtitle": "This helps us adjust the editor to your workflow.",
  "steps.experience_level.option_beginner": "I'm just getting started",
  "steps.experience_level.option_intermediate": "I have some experience",
  "steps.experience_level.option_advanced": "I'm very comfortable with Elementor",
  "steps.theme_selection.title": "Start with a theme that fits your needs",
  "steps.theme_selection.subtitle": "Hello themes are built to work seamlessly with Elementor.",
  "steps.theme_selection.aria_label": "Theme selection",
  "steps.theme_selection.theme_hello_label": "Hello",
  "steps.theme_selection.theme_hello_description": "A flexible canvas theme you can shape from the ground up",
  "steps.theme_selection.theme_hello_biz_label": "Hello Biz",
  "steps.theme_selection.theme_hello_biz_description": "A ready-to-start theme with smart layouts and widgets",
  "steps.theme_selection.greeting_beginner": "Glad you're here!",
  "steps.theme_selection.greeting_default": "Great. Let's take it to the next step",
  "steps.theme_selection.continue_with_theme": "Continue with this theme",
  "steps.site_features.title": "What do you want to include in your site?",
  "steps.site_features.subtitle": "We'll use this to tailor suggestions for you.",
  "steps.site_features.continue_with_free": "Continue with Free",
  "steps.site_features.option_classes_variables": "Classes & variables",
  "steps.site_features.option_core_placeholder": "Core placeholder",
  "steps.site_features.option_theme_builder": "Theme builder",
  "steps.site_features.option_lead_collection": "Lead Collection",
  "steps.site_features.option_custom_code": "Custom Code",
  "steps.site_features.option_email_deliverability": "Email deliverability",
  "steps.site_features.option_ai_generator": "AI generator",
  "steps.site_features.option_image_optimization": "Image optimization",
  "steps.site_features.option_accessibility_tools": "Accessibility tools",
  "steps.site_features.included": "Included",
  "steps.site_features.plan_recommendation_prefix": "Based on the features you chose, we recommend the",
  "steps.site_features.plan_recommendation_suffix": "plan",
  "steps.site_features.compare_plans": "Compare plans",
  "steps.site_features.woocommerce": "WooCommerce",
  "pro_install.title": "You already have a Pro subscription",
  "pro_install.subtitle": "Would you like to install it on this site now?",
  "pro_install.installing": "Installing Elementor Pro\u2026",
  "pro_install.installing_short": "Installing\u2026",
  "pro_install.install_button": "Install Pro on this site",
  "pro_install.logo_alt": "Elementor + Elementor Pro",
  "pro_install.do_it_later": "I'll do it later",
  "completion.title": "Getting things ready",
  "completion.subtitle": "Tailoring the editor to your goals and workflow\u2026"
};

// src/utils/translations.ts
var t = createTranslate({
  configKey: "e-onboarding",
  defaultStrings: DEFAULT_STRINGS
});

// src/store/slice.ts
function getDefaultSteps() {
  return [
    { id: StepId.BUILDING_FOR, label: t("steps.building_for.title"), type: "single" },
    { id: StepId.SITE_ABOUT, label: t("steps.site_about.title"), type: "multiple" },
    {
      id: StepId.EXPERIENCE_LEVEL,
      label: t("steps.experience_level.title"),
      type: "single"
    },
    {
      id: StepId.THEME_SELECTION,
      label: t("steps.theme_selection.title"),
      type: "single"
    },
    {
      id: StepId.SITE_FEATURES,
      label: t("steps.site_features.title"),
      type: "multiple"
    }
  ];
}
function parseStepsFromConfig(configSteps) {
  if (!configSteps || configSteps.length === 0) {
    return getDefaultSteps();
  }
  return configSteps.map((step) => ({
    id: step.id,
    label: step.label,
    type: step.type || "single"
  }));
}
function parseCompletedSteps(completedSteps) {
  if (!completedSteps) {
    return [];
  }
  return completedSteps;
}
function getDefaultChoices() {
  return {
    building_for: null,
    site_about: [],
    experience_level: null,
    theme_selection: null,
    site_features: []
  };
}
function getEmptyState() {
  const steps = getDefaultSteps();
  return {
    steps,
    currentStepId: steps[0]?.id ?? StepId.BUILDING_FOR,
    currentStepIndex: 0,
    completedSteps: [],
    exitType: null,
    lastActiveTimestamp: null,
    startedAt: null,
    completedAt: null,
    choices: getDefaultChoices(),
    isLoading: false,
    error: null,
    hadUnexpectedExit: false,
    isConnected: false,
    isGuest: false,
    userName: "",
    urls: { dashboard: "", editor: "", connect: "", comparePlans: "", upgradeUrl: "" },
    shouldShowProInstallScreen: false,
    hasProInstallScreenDismissed: false
  };
}
function buildStateFromConfig(config) {
  if (!config) {
    return getEmptyState();
  }
  const steps = parseStepsFromConfig(config.steps);
  const firstStepId = steps[0]?.id ?? StepId.BUILDING_FOR;
  const progress = config.progress ?? {};
  let currentStepIndex = progress.current_step_index ?? 0;
  if (currentStepIndex < 0 || currentStepIndex >= steps.length) {
    currentStepIndex = 0;
  }
  const currentStepId = steps[currentStepIndex]?.id ?? firstStepId;
  return {
    steps,
    currentStepId,
    currentStepIndex,
    completedSteps: parseCompletedSteps(progress.completed_steps),
    exitType: progress.exit_type ?? null,
    lastActiveTimestamp: progress.last_active_timestamp ?? null,
    startedAt: progress.started_at ?? null,
    completedAt: progress.completed_at ?? null,
    choices: { ...getDefaultChoices(), ...config.choices },
    isLoading: false,
    error: null,
    hadUnexpectedExit: config.hadUnexpectedExit ?? false,
    isConnected: config.isConnected ?? false,
    isGuest: false,
    userName: config.userName ?? "",
    urls: config.urls ?? {
      dashboard: "",
      editor: "",
      connect: "",
      comparePlans: "",
      upgradeUrl: ""
    },
    shouldShowProInstallScreen: config.shouldShowProInstallScreen ?? false,
    hasProInstallScreenDismissed: false
  };
}
var slice = __createSlice({
  name: "onboarding",
  initialState: getEmptyState(),
  reducers: {
    initFromConfig: (state) => {
      const config = window.elementorAppConfig?.["e-onboarding"];
      if (config) {
        const newState = buildStateFromConfig(config);
        return newState;
      }
      return state;
    },
    goToStep: (state, action) => {
      const stepId = action.payload;
      const stepIndex = state.steps.findIndex((s) => s.id === stepId);
      if (stepIndex !== -1) {
        state.currentStepId = stepId;
        state.currentStepIndex = stepIndex;
      }
    },
    goToStepIndex: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.steps.length) {
        state.currentStepId = state.steps[index].id;
        state.currentStepIndex = index;
      }
    },
    nextStep: (state) => {
      const nextIndex = state.currentStepIndex + 1;
      if (nextIndex < state.steps.length) {
        state.currentStepId = state.steps[nextIndex].id;
        state.currentStepIndex = nextIndex;
      }
    },
    prevStep: (state) => {
      const prevIndex = state.currentStepIndex - 1;
      if (prevIndex >= 0) {
        state.currentStepId = state.steps[prevIndex].id;
        state.currentStepIndex = prevIndex;
      }
    },
    completeStep: (state, action) => {
      const stepId = action.payload;
      if (!state.completedSteps.includes(stepId)) {
        state.completedSteps.push(stepId);
      }
    },
    setUserChoice: (state, action) => {
      const { key, value } = action.payload;
      state.choices[key] = value;
    },
    setUserChoices: (state, action) => {
      state.choices = { ...state.choices, ...action.payload };
    },
    setExitType: (state, action) => {
      state.exitType = action.payload;
    },
    startOnboarding: (state) => {
      state.startedAt = Date.now();
      state.exitType = null;
      state.hadUnexpectedExit = false;
    },
    completeOnboarding: (state) => {
      state.completedAt = Date.now();
      state.exitType = "user_exit";
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearUnexpectedExit: (state) => {
      state.hadUnexpectedExit = false;
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setGuest: (state, action) => {
      state.isGuest = action.payload;
    },
    setShouldShowProInstallScreen: (state, action) => {
      state.shouldShowProInstallScreen = action.payload;
    },
    dismissProInstallScreen: (state) => {
      state.hasProInstallScreenDismissed = true;
    },
    markProInstalled: (state) => {
      state.hasProInstallScreenDismissed = true;
      state.steps = state.steps.filter((step) => step.id !== StepId.SITE_FEATURES);
    }
  }
});
var {
  initFromConfig,
  goToStep,
  goToStepIndex,
  nextStep,
  prevStep,
  completeStep,
  setUserChoice,
  setUserChoices,
  setExitType,
  startOnboarding,
  completeOnboarding,
  setLoading,
  setError,
  clearUnexpectedExit,
  setConnected,
  setGuest,
  setShouldShowProInstallScreen,
  dismissProInstallScreen,
  markProInstalled
} = slice.actions;
function registerOnboardingSlice() {
  __registerSlice(slice);
}

// src/store/selectors.ts
import { __createSelector } from "@elementor/store";
var selectSteps = (state) => state.onboarding.steps;
var selectCurrentStepId = (state) => state.onboarding.currentStepId;
var selectCurrentStepIndex = (state) => state.onboarding.currentStepIndex;
var selectCompletedSteps = (state) => state.onboarding.completedSteps;
var selectChoices = (state) => state.onboarding.choices;
var selectIsLoading = (state) => state.onboarding.isLoading;
var selectError = (state) => state.onboarding.error;
var selectHadUnexpectedExit = (state) => state.onboarding.hadUnexpectedExit;
var selectIsConnected = (state) => state.onboarding.isConnected;
var selectIsGuest = (state) => state.onboarding.isGuest;
var selectUserName = (state) => state.onboarding.userName;
var selectUrls = (state) => state.onboarding.urls;
var selectShouldShowProInstallScreen = (state) => state.onboarding.shouldShowProInstallScreen;
var selectHasProInstallScreenDismissed = (state) => state.onboarding.hasProInstallScreenDismissed;
var selectCurrentStep = __createSelector(
  [selectSteps, selectCurrentStepIndex],
  (steps, index) => steps[index] ?? null
);
var selectIsFirstStep = __createSelector([selectCurrentStepIndex], (index) => index === 0);
var selectIsLastStep = __createSelector(
  [selectSteps, selectCurrentStepIndex],
  (steps, index) => index === steps.length - 1
);
var selectTotalSteps = __createSelector([selectSteps], (steps) => steps.length);
var selectIsStepCompleted = __createSelector(
  [selectCompletedSteps, (_state, stepId) => stepId],
  (completedSteps, stepId) => completedSteps.includes(stepId)
);
var selectHasPassedLogin = __createSelector(
  [selectIsConnected, selectIsGuest],
  (isConnected, isGuest) => isConnected || isGuest
);
var selectShouldShowProInstall = __createSelector(
  [selectIsConnected, selectShouldShowProInstallScreen, selectHasProInstallScreenDismissed],
  (isConnected, shouldShowProInstallScreen, isDismissed) => isConnected && shouldShowProInstallScreen && !isDismissed
);

// src/components/app-content.tsx
import * as React31 from "react";
import { useCallback as useCallback10, useEffect as useEffect4, useMemo as useMemo6, useState as useState2 } from "react";
import { Box as Box16 } from "@elementor/ui";

// src/hooks/use-check-pro-install-screen.ts
import { useCallback } from "react";

// src/utils/get-config.ts
function getConfig() {
  return window.elementorAppConfig?.["e-onboarding"] ?? null;
}

// src/hooks/use-check-pro-install-screen.ts
function useCheckProInstallScreen() {
  const checkProInstallScreen = useCallback(async () => {
    const config = getConfig();
    if (!config) {
      return { shouldShowProInstallScreen: false };
    }
    const response = await fetch(`${config.restUrl}pro-install-screen`, {
      method: "GET",
      headers: {
        "X-WP-Nonce": config.nonce
      }
    });
    if (!response.ok) {
      return { shouldShowProInstallScreen: false };
    }
    const json = await response.json();
    return {
      shouldShowProInstallScreen: json.data?.shouldShowProInstallScreen ?? false
    };
  }, []);
  return checkProInstallScreen;
}

// src/hooks/use-elementor-connect.ts
import { useCallback as useCallback2, useEffect, useRef } from "react";
var POPUP_WIDTH = 600;
var POPUP_HEIGHT = 700;
var POPUP_TOP = 200;
var POPUP_LEFT = 0;
function useElementorConnect({ connectUrl, onSuccess }) {
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  useEffect(() => {
    const handleSuccess = () => {
      onSuccessRef.current?.();
    };
    window.addEventListener("elementor/connect/success", handleSuccess);
    return () => {
      window.removeEventListener("elementor/connect/success", handleSuccess);
    };
  }, []);
  const triggerConnect = useCallback2(() => {
    if (!connectUrl) {
      return;
    }
    const separator = connectUrl.includes("?") ? "&" : "?";
    const popupUrl = `${connectUrl}${separator}mode=popup`;
    const features = `toolbar=no,menubar=no,width=${POPUP_WIDTH},height=${POPUP_HEIGHT},top=${POPUP_TOP},left=${POPUP_LEFT}`;
    const popup = window.open(popupUrl, "elementorConnect", features);
    if (!popup) {
      window.location.href = connectUrl;
    }
  }, [connectUrl]);
  return triggerConnect;
}

// src/hooks/use-onboarding.ts
import { useMemo } from "react";
import { __useDispatch, __useSelector } from "@elementor/store";
function useOnboarding() {
  const dispatch = __useDispatch();
  const stepId = __useSelector(selectCurrentStepId);
  const stepIndex = __useSelector(selectCurrentStepIndex);
  const step = __useSelector(selectCurrentStep);
  const steps = __useSelector(selectSteps);
  const isFirst = __useSelector(selectIsFirstStep);
  const isLast = __useSelector(selectIsLastStep);
  const totalSteps = __useSelector(selectTotalSteps);
  const completedSteps = __useSelector(selectCompletedSteps);
  const choices = __useSelector(selectChoices);
  const isLoading = __useSelector(selectIsLoading);
  const error = __useSelector(selectError);
  const hadUnexpectedExit = __useSelector(selectHadUnexpectedExit);
  const isConnected = __useSelector(selectIsConnected);
  const isGuest = __useSelector(selectIsGuest);
  const hasPassedLogin = __useSelector(selectHasPassedLogin);
  const shouldShowProInstall = __useSelector(selectShouldShowProInstall);
  const userName = __useSelector(selectUserName);
  const urls = __useSelector(selectUrls);
  const actions = useMemo(
    () => ({
      goToStep: (id) => dispatch(goToStep(id)),
      goToStepIndex: (index) => dispatch(goToStepIndex(index)),
      nextStep: () => dispatch(nextStep()),
      prevStep: () => dispatch(prevStep()),
      completeStep: (id) => dispatch(completeStep(id)),
      setUserChoice: (key, value) => dispatch(setUserChoice({ key, value })),
      setUserChoices: (data) => dispatch(setUserChoices(data)),
      setExitType: (type) => dispatch(setExitType(type)),
      startOnboarding: () => dispatch(startOnboarding()),
      completeOnboarding: () => dispatch(completeOnboarding()),
      setLoading: (loading) => dispatch(setLoading(loading)),
      setError: (err) => dispatch(setError(err)),
      clearUnexpectedExit: () => dispatch(clearUnexpectedExit()),
      setConnected: (connected) => dispatch(setConnected(connected)),
      setGuest: (guest) => dispatch(setGuest(guest)),
      setShouldShowProInstallScreen: (value) => dispatch(setShouldShowProInstallScreen(value)),
      dismissProInstallScreen: () => dispatch(dismissProInstallScreen()),
      markProInstalled: () => dispatch(markProInstalled())
    }),
    [dispatch]
  );
  return {
    stepId,
    stepIndex,
    step,
    steps,
    isFirst,
    isLast,
    totalSteps,
    completedSteps,
    choices,
    isLoading,
    error,
    hadUnexpectedExit,
    isConnected,
    isGuest,
    hasPassedLogin,
    shouldShowProInstall,
    userName,
    urls,
    actions
  };
}

// src/hooks/use-update-choices.ts
import { useMutation } from "@elementor/query";
async function updateChoices(params) {
  const config = getConfig();
  if (!config) {
    throw new Error("Onboarding config not found");
  }
  const response = await fetch(`${config.restUrl}user-choices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WP-Nonce": config.nonce
    },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    throw new Error("Failed to update choices");
  }
}
function useUpdateChoices() {
  return useMutation({
    mutationFn: updateChoices
  });
}

// src/hooks/use-update-progress.ts
import { useMutation as useMutation2 } from "@elementor/query";
async function updateProgress(params) {
  const config = getConfig();
  if (!config) {
    throw new Error("Onboarding config not found");
  }
  const response = await fetch(`${config.restUrl}user-progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WP-Nonce": config.nonce
    },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    throw new Error("Failed to update progress");
  }
}
function useUpdateProgress() {
  return useMutation2({
    mutationFn: updateProgress
  });
}

// src/steps/screens/building-for.tsx
import * as React2 from "react";
import { useCallback as useCallback3, useMemo as useMemo2 } from "react";
import { ChevronRightSmallIcon } from "@elementor/icons";
import { Stack, withDirection } from "@elementor/ui";

// src/components/ui/greeting-banner.tsx
import * as React from "react";
import { Typography as Typography2 } from "@elementor/ui";

// src/components/ui/styled-components.ts
import { Box, styled, Typography } from "@elementor/ui";
var GREETING_BANNER_BG_COLOR = "#fae4fa";
var StepTitle = styled(Typography)({
  fontWeight: 500,
  fontFamily: "Poppins"
});
var GreetingBannerRoot = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  paddingInline: theme.spacing(3),
  paddingBlock: theme.spacing(1.5),
  borderRadius: 16,
  backgroundColor: GREETING_BANNER_BG_COLOR,
  alignSelf: "flex-start"
}));

// src/components/ui/greeting-banner.tsx
function GreetingBanner({ children }) {
  return /* @__PURE__ */ React.createElement(GreetingBannerRoot, null, /* @__PURE__ */ React.createElement(Typography2, { variant: "body1", color: "text.primary", align: "center" }, children));
}

// src/components/ui/option-button.tsx
import { Button, styled as styled2 } from "@elementor/ui";
var OptionButton = styled2(Button)(({ theme }) => ({
  justifyContent: "space-between",
  height: 56,
  borderRadius: 8,
  textTransform: "none",
  fontWeight: theme.typography.body1.fontWeight,
  fontSize: theme.typography.body1.fontSize,
  letterSpacing: theme.typography.body1.letterSpacing,
  lineHeight: theme.typography.body1.lineHeight,
  color: theme.palette.text.secondary,
  borderColor: theme.palette.divider,
  paddingInlineStart: 20,
  paddingInlineEnd: 12,
  "& .MuiButton-endIcon": {
    opacity: 0
  },
  "&:hover": {
    borderColor: theme.palette.divider,
    "& .MuiButton-endIcon": {
      opacity: 1
    }
  },
  "&:focus, &:active, &.Mui-focusVisible": {
    outline: "none",
    backgroundColor: "transparent",
    borderColor: theme.palette.divider
  },
  "&.Mui-selected": {
    borderWidth: 2,
    borderColor: theme.palette.text.primary,
    "& .MuiButton-endIcon": {
      opacity: 1
    },
    "&:hover": {
      borderColor: theme.palette.text.primary
    }
  }
}));

// src/steps/screens/building-for.tsx
var GREETING_WAVE = "\u{1F44B}";
var DirectionalChevronIcon = withDirection(ChevronRightSmallIcon);
var BUILDING_FOR_OPTIONS = [
  { value: "myself", labelKey: "steps.building_for.option_myself" },
  { value: "business", labelKey: "steps.building_for.option_business" },
  { value: "client", labelKey: "steps.building_for.option_client" },
  { value: "exploring", labelKey: "steps.building_for.option_exploring" }
];
function BuildingFor({ onComplete }) {
  const { userName, isConnected, isGuest, choices, actions } = useOnboarding();
  const selectedValue = choices.building_for;
  const greetingText = useMemo2(() => {
    const showName = isConnected && !isGuest && userName;
    if (showName) {
      return t("steps.building_for.greeting_with_name", userName, GREETING_WAVE);
    }
    return t("steps.building_for.greeting_without_name", GREETING_WAVE);
  }, [userName, isConnected, isGuest]);
  const handleSelect = useCallback3(
    (value) => {
      actions.setUserChoice("building_for", value);
      onComplete({ building_for: value });
    },
    [actions, onComplete]
  );
  return /* @__PURE__ */ React2.createElement(Stack, { spacing: 7.5, "data-testid": "building-for-step" }, /* @__PURE__ */ React2.createElement(GreetingBanner, null, greetingText), /* @__PURE__ */ React2.createElement(Stack, { spacing: 4, alignItems: "center" }, /* @__PURE__ */ React2.createElement(StepTitle, { variant: "h5", align: "center" }, t("steps.building_for.title")), /* @__PURE__ */ React2.createElement(Stack, { spacing: 2, width: "100%" }, BUILDING_FOR_OPTIONS.map((option) => {
    const isSelected = selectedValue === option.value;
    return /* @__PURE__ */ React2.createElement(
      OptionButton,
      {
        key: option.value,
        variant: "outlined",
        fullWidth: true,
        className: isSelected ? "Mui-selected" : void 0,
        endIcon: /* @__PURE__ */ React2.createElement(DirectionalChevronIcon, null),
        onClick: () => handleSelect(option.value),
        "aria-pressed": isSelected
      },
      t(option.labelKey)
    );
  }))));
}

// src/steps/screens/experience-level.tsx
import * as React3 from "react";
import { useCallback as useCallback4 } from "react";
import { ChevronRightSmallIcon as ChevronRightSmallIcon2 } from "@elementor/icons";
import { Stack as Stack2, Typography as Typography3, withDirection as withDirection2 } from "@elementor/ui";
var DirectionalChevronIcon2 = withDirection2(ChevronRightSmallIcon2);
var OPTIONS = [
  { id: "beginner", labelKey: "steps.experience_level.option_beginner" },
  { id: "intermediate", labelKey: "steps.experience_level.option_intermediate" },
  { id: "advanced", labelKey: "steps.experience_level.option_advanced" }
];
function ExperienceLevel({ onComplete }) {
  const { choices, actions } = useOnboarding();
  const selectedValue = choices.experience_level;
  const handleSelect = useCallback4(
    (value) => {
      actions.setUserChoice("experience_level", value);
      onComplete({ experience_level: value });
    },
    [actions, onComplete]
  );
  return /* @__PURE__ */ React3.createElement(Stack2, { spacing: 4, width: "100%", "data-testid": "experience-level-step" }, /* @__PURE__ */ React3.createElement(Stack2, { spacing: 1, textAlign: "center", alignItems: "center" }, /* @__PURE__ */ React3.createElement(StepTitle, { variant: "h5", align: "center", maxWidth: 325 }, t("steps.experience_level.title")), /* @__PURE__ */ React3.createElement(Typography3, { variant: "body1", color: "text.secondary" }, t("steps.experience_level.subtitle"))), /* @__PURE__ */ React3.createElement(Stack2, { spacing: 2 }, OPTIONS.map((option) => {
    const isSelected = selectedValue === option.id;
    return /* @__PURE__ */ React3.createElement(
      OptionButton,
      {
        key: option.id,
        variant: "outlined",
        fullWidth: true,
        className: isSelected ? "Mui-selected" : void 0,
        endIcon: /* @__PURE__ */ React3.createElement(DirectionalChevronIcon2, null),
        onClick: () => handleSelect(option.id),
        "aria-pressed": isSelected
      },
      t(option.labelKey)
    );
  })));
}

// src/steps/screens/login.tsx
import * as React5 from "react";
import { ChevronRightIcon } from "@elementor/icons";
import { Box as Box3, Divider, Image, Stack as Stack3, styled as styled4, Typography as Typography4 } from "@elementor/ui";

// src/components/fullscreen-card.tsx
import * as React4 from "react";
import { Box as Box2, Button as Button2, Paper, styled as styled3 } from "@elementor/ui";

// src/steps/step-visuals.ts
var ONBOARDING_ASSETS_PATH = "images/app/e-onboarding/";
var getAssetsBaseUrl = () => window.elementorCommon?.config?.urls?.assets ?? "";
var getOnboardingAssetUrl = (fileName) => {
  const baseUrl = getAssetsBaseUrl();
  const path = `${ONBOARDING_ASSETS_PATH}${fileName}`;
  return baseUrl ? `${baseUrl}${path}` : path;
};
var buildBackground = (fileName) => {
  const imageUrl = getOnboardingAssetUrl(fileName);
  return `url(${imageUrl}) center / cover no-repeat`;
};
var DEFAULT_CONFIG = {
  imageLayout: "wide",
  background: buildBackground("step-1.png"),
  assets: []
};
var LOGIN_CONFIG = {
  imageLayout: "wide",
  background: buildBackground("login.png"),
  assets: []
};
var stepVisuals = {
  [StepId.BUILDING_FOR]: {
    imageLayout: "wide",
    background: buildBackground("step-1.png"),
    assets: []
  },
  [StepId.SITE_ABOUT]: {
    imageLayout: "narrow",
    background: buildBackground("step-2.png"),
    assets: []
  },
  [StepId.EXPERIENCE_LEVEL]: {
    imageLayout: "wide",
    background: buildBackground("step-3.png"),
    assets: []
  },
  [StepId.THEME_SELECTION]: {
    imageLayout: "narrow",
    background: buildBackground("step-4.png"),
    assets: []
  },
  [StepId.SITE_FEATURES]: {
    imageLayout: "narrow",
    background: buildBackground("step-5.png"),
    assets: [],
    contentMaxWidth: 724
  }
};
var getStepVisualConfig = (stepId) => stepVisuals[stepId] ?? DEFAULT_CONFIG;

// src/components/fullscreen-card.tsx
var BACKDROP_OPACITY = 0.6;
var FullscreenCardRoot = styled3(Box2, {
  shouldForwardProp: (prop) => prop !== "backgroundUrl"
})(({ theme, backgroundUrl: backgroundUrl2 }) => ({
  position: "relative",
  minHeight: "100%",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
  backgroundImage: `url(${backgroundUrl2})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat"
}));
var Backdrop = styled3(Box2)(({ theme }) => ({
  position: "absolute",
  inset: 0,
  backgroundColor: theme.palette.text.primary,
  opacity: BACKDROP_OPACITY
}));
var Card = styled3(Paper)(({ theme }) => ({
  width: 512,
  maxWidth: "90%",
  padding: theme.spacing(6, 6, 5),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[24],
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(3),
  position: "relative",
  zIndex: 1
}));
var PrimaryButton = styled3(Button2)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontSize: theme.typography.pxToRem(15),
  fontWeight: 500,
  letterSpacing: "0.46px",
  lineHeight: theme.typography.pxToRem(26),
  padding: theme.spacing(1, 2.75)
}));
var SecondaryButton = styled3(Button2)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontSize: theme.typography.pxToRem(15),
  fontWeight: 500,
  letterSpacing: "0.46px",
  lineHeight: theme.typography.pxToRem(26),
  padding: theme.spacing(1, 1.5)
}));
var TextButton = styled3(Button2)(({ theme }) => ({
  textTransform: "none",
  fontSize: theme.typography.pxToRem(13),
  fontWeight: 500,
  letterSpacing: "0.46px",
  lineHeight: theme.typography.pxToRem(22)
}));
var backgroundUrl = getOnboardingAssetUrl("login.png");
function FullscreenCard({ children, "data-testid": testId }) {
  return /* @__PURE__ */ React4.createElement(FullscreenCardRoot, { backgroundUrl, "data-testid": testId }, /* @__PURE__ */ React4.createElement(Backdrop, null), /* @__PURE__ */ React4.createElement(Card, { elevation: 24 }, children));
}

// src/steps/screens/login.tsx
var SocialIcon = styled4(Box3)(({ theme }) => ({
  borderRadius: 100,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
  backgroundColor: theme.palette.common.white,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center"
}));
function Login({ onConnect, onContinueAsGuest }) {
  return /* @__PURE__ */ React5.createElement(FullscreenCard, { "data-testid": "login-screen" }, /* @__PURE__ */ React5.createElement(Typography4, { variant: "h5", align: "center", fontWeight: 500, fontFamily: "Poppins" }, t("login.title")), /* @__PURE__ */ React5.createElement(Stack3, { spacing: 3, width: "100%" }, /* @__PURE__ */ React5.createElement(PrimaryButton, { variant: "contained", color: "primary", fullWidth: true, size: "large", onClick: onConnect }, t("login.sign_in")), /* @__PURE__ */ React5.createElement(Stack3, { direction: "row", alignItems: "center", justifyContent: "center", spacing: 2 }, /* @__PURE__ */ React5.createElement(Divider, { sx: { width: 80 } }), /* @__PURE__ */ React5.createElement(Typography4, { variant: "body2", color: "text.tertiary" }, t("login.or")), /* @__PURE__ */ React5.createElement(Divider, { sx: { width: 80 } })), /* @__PURE__ */ React5.createElement(Stack3, { spacing: 6 }, /* @__PURE__ */ React5.createElement(Stack3, { spacing: 2, alignItems: "center" }, /* @__PURE__ */ React5.createElement(
    SecondaryButton,
    {
      variant: "text",
      color: "secondary",
      fullWidth: true,
      size: "large",
      endIcon: /* @__PURE__ */ React5.createElement(ChevronRightIcon, { fontSize: "tiny" }),
      onClick: onConnect
    },
    t("login.continue_another_way")
  ), /* @__PURE__ */ React5.createElement(Stack3, { direction: "row" }, /* @__PURE__ */ React5.createElement(SocialIcon, null, /* @__PURE__ */ React5.createElement(Image, { src: getOnboardingAssetUrl("google.svg"), alt: "Google", variant: "circle" })), /* @__PURE__ */ React5.createElement(SocialIcon, { sx: { marginInlineStart: "-10px" } }, /* @__PURE__ */ React5.createElement(
    Image,
    {
      src: getOnboardingAssetUrl("facebook.svg"),
      alt: "Facebook",
      variant: "circle"
    }
  )), /* @__PURE__ */ React5.createElement(SocialIcon, { sx: { marginInlineStart: "-10px" } }, /* @__PURE__ */ React5.createElement(Image, { src: getOnboardingAssetUrl("apple.svg"), alt: "Apple", variant: "circle" })))), /* @__PURE__ */ React5.createElement(TextButton, { variant: "text", color: "info", onClick: onContinueAsGuest }, t("login.continue_as_guest")))));
}

// src/steps/screens/pro-install.tsx
import * as React6 from "react";
import { useCallback as useCallback5 } from "react";
import { CircularProgress, Stack as Stack4, styled as styled5, Typography as Typography5 } from "@elementor/ui";

// src/hooks/use-install-pro.ts
import { useMutation as useMutation3 } from "@elementor/query";
async function installPro() {
  const config = getConfig();
  if (!config) {
    throw new Error("Onboarding config not found");
  }
  const response = await fetch(`${config.restUrl}install-pro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WP-Nonce": config.nonce
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Failed to install Elementor Pro");
  }
  const json = await response.json();
  return json.data;
}
function useInstallPro() {
  return useMutation3({
    mutationFn: installPro
  });
}

// src/steps/screens/pro-install.tsx
var ProLogo = styled5("img")(({ theme }) => ({
  maxWidth: 200,
  height: "auto",
  margin: theme.spacing(1, 0)
}));
function ProInstall() {
  const { actions } = useOnboarding();
  const installPro2 = useInstallPro();
  const handleInstall = useCallback5(() => {
    installPro2.mutate(void 0, {
      onSuccess: () => {
        actions.markProInstalled();
      }
    });
  }, [installPro2, actions]);
  const handleDismiss = useCallback5(() => {
    actions.dismissProInstallScreen();
  }, [actions]);
  const isInstalling = installPro2.isPending;
  const error = installPro2.error?.message ?? null;
  return /* @__PURE__ */ React6.createElement(FullscreenCard, { "data-testid": "pro-install-screen" }, /* @__PURE__ */ React6.createElement(Typography5, { variant: "h5", align: "center", fontWeight: 500, fontFamily: "Poppins" }, t("pro_install.title")), /* @__PURE__ */ React6.createElement(Typography5, { variant: "body2", align: "center", color: "text.secondary" }, isInstalling ? t("pro_install.installing") : t("pro_install.subtitle")), /* @__PURE__ */ React6.createElement(ProLogo, { src: getOnboardingAssetUrl("install-pro-logo.png"), alt: t("pro_install.logo_alt") }), error && /* @__PURE__ */ React6.createElement(Typography5, { variant: "body2", align: "center", color: "error" }, error), /* @__PURE__ */ React6.createElement(Stack4, { spacing: 2, width: "100%", alignItems: "center" }, /* @__PURE__ */ React6.createElement(
    PrimaryButton,
    {
      variant: "contained",
      color: "primary",
      fullWidth: true,
      size: "large",
      onClick: handleInstall,
      disabled: isInstalling,
      startIcon: isInstalling ? /* @__PURE__ */ React6.createElement(CircularProgress, { size: 18, color: "inherit" }) : void 0
    },
    isInstalling ? t("pro_install.installing_short") : t("pro_install.install_button")
  ), /* @__PURE__ */ React6.createElement(TextButton, { variant: "text", color: "info", onClick: handleDismiss, disabled: isInstalling }, t("pro_install.do_it_later"))));
}

// src/steps/screens/site-about.tsx
import * as React11 from "react";
import { useCallback as useCallback6, useMemo as useMemo3 } from "react";
import { Stack as Stack5, Typography as Typography7 } from "@elementor/ui";

// src/components/site-about/constants.ts
import {
  BriefcaseIcon,
  CalendarIcon,
  CartIcon,
  DomainIcon,
  LandingPageTemplateIcon,
  PostTypeIcon,
  SearchIcon
} from "@elementor/icons";

// src/components/site-about/organization-icon.tsx
import * as React7 from "react";
import { SvgIcon } from "@elementor/ui";
var OrganizationIcon = React7.forwardRef((props, ref) => {
  return /* @__PURE__ */ React7.createElement(SvgIcon, { viewBox: "0 0 32 32", ...props, ref, fill: "currentColor", width: "32", height: "32" }, /* @__PURE__ */ React7.createElement(
    "path",
    {
      d: "M22.7454 20.6947C23.3691 20.2687 24.1007 20.0281 24.8555 20.0006C25.6103 19.9731 26.3574 20.1598 27.0105 20.5392C27.6636 20.9186 28.1959 21.4752 28.5458 22.1445C28.8958 22.8138 29.0491 23.5685 28.9881 24.3213C27.3883 24.8804 25.6891 25.098 24.0001 24.96C23.9949 23.4488 23.5597 21.969 22.7454 20.696C22.0226 19.5624 21.0256 18.6294 19.8465 17.9833C18.6675 17.3373 17.3445 16.9991 16.0001 17C14.6558 16.9993 13.3332 17.3376 12.1544 17.9837C10.9756 18.6297 9.97873 19.5626 9.25606 20.696M23.9987 24.9587L24.0001 25C24.0001 25.3 23.9841 25.596 23.9507 25.888C21.5312 27.2762 18.7895 28.0045 16.0001 28C13.1067 28 10.3907 27.232 8.0494 25.888C8.01512 25.5794 7.99864 25.2691 8.00006 24.9587M8.00006 24.9587C6.31157 25.1017 4.61327 24.8849 3.01473 24.3227C2.95386 23.5701 3.10725 22.8156 3.45717 22.1465C3.80708 21.4774 4.33922 20.9211 4.99206 20.5417C5.64491 20.1624 6.39179 19.9755 7.14635 20.0028C7.90092 20.0301 8.63234 20.2705 9.25606 20.696M8.00006 24.9587C8.00485 23.4476 8.44223 21.9692 9.25606 20.696M20.0001 9C20.0001 10.0609 19.5786 11.0783 18.8285 11.8284C18.0783 12.5786 17.0609 13 16.0001 13C14.9392 13 13.9218 12.5786 13.1716 11.8284C12.4215 11.0783 12.0001 10.0609 12.0001 9C12.0001 7.93913 12.4215 6.92172 13.1716 6.17157C13.9218 5.42143 14.9392 5 16.0001 5C17.0609 5 18.0783 5.42143 18.8285 6.17157C19.5786 6.92172 20.0001 7.93913 20.0001 9ZM28.0001 13C28.0001 13.394 27.9225 13.7841 27.7717 14.1481C27.6209 14.512 27.4 14.8427 27.1214 15.1213C26.8428 15.3999 26.5121 15.6209 26.1481 15.7716C25.7841 15.9224 25.394 16 25.0001 16C24.6061 16 24.216 15.9224 23.852 15.7716C23.488 15.6209 23.1573 15.3999 22.8787 15.1213C22.6002 14.8427 22.3792 14.512 22.2284 14.1481C22.0777 13.7841 22.0001 13.394 22.0001 13C22.0001 12.2044 22.3161 11.4413 22.8787 10.8787C23.4414 10.3161 24.2044 10 25.0001 10C25.7957 10 26.5588 10.3161 27.1214 10.8787C27.684 11.4413 28.0001 12.2044 28.0001 13ZM10.0001 13C10.0001 13.394 9.92246 13.7841 9.7717 14.1481C9.62094 14.512 9.39996 14.8427 9.12138 15.1213C8.84281 15.3999 8.51209 15.6209 8.14811 15.7716C7.78414 15.9224 7.39403 16 7.00006 16C6.6061 16 6.21599 15.9224 5.85201 15.7716C5.48803 15.6209 5.15732 15.3999 4.87874 15.1213C4.60017 14.8427 4.37919 14.512 4.22842 14.1481C4.07766 13.7841 4.00006 13.394 4.00006 13C4.00006 12.2044 4.31613 11.4413 4.87874 10.8787C5.44135 10.3161 6.20441 10 7.00006 10C7.79571 10 8.55877 10.3161 9.12138 10.8787C9.68399 11.4413 10.0001 12.2044 10.0001 13Z",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ));
});
var organization_icon_default = OrganizationIcon;

// src/components/site-about/constants.ts
var SITE_ABOUT_OPTIONS = [
  { value: "small_business", labelKey: "steps.site_about.option_small_med_business", icon: BriefcaseIcon },
  { value: "online_store", labelKey: "steps.site_about.option_online_store", icon: CartIcon },
  { value: "company_site", labelKey: "steps.site_about.option_company_site", icon: DomainIcon },
  { value: "blog", labelKey: "steps.site_about.option_blog", icon: PostTypeIcon },
  { value: "landing_page", labelKey: "steps.site_about.option_landing_page", icon: LandingPageTemplateIcon },
  { value: "booking", labelKey: "steps.site_about.option_booking", icon: CalendarIcon },
  { value: "organization", labelKey: "steps.site_about.option_organization", icon: organization_icon_default },
  { value: "other", labelKey: "steps.site_about.option_other", icon: SearchIcon }
];
var GREETING_KEY_MAP = {
  myself: "steps.site_about.greeting_myself",
  business: "steps.site_about.greeting_business",
  client: "steps.site_about.greeting_client",
  exploring: "steps.site_about.greeting_myself"
};
var GREETING_FALLBACK_KEY = "steps.site_about.greeting_fallback";
function getGreeting(buildingFor) {
  const key = GREETING_KEY_MAP[buildingFor] ?? GREETING_FALLBACK_KEY;
  return t(key);
}

// src/components/site-about/option-card.tsx
import * as React9 from "react";
import { CheckIcon } from "@elementor/icons";
import { Typography as Typography6 } from "@elementor/ui";

// src/components/ui/selection-badge.tsx
import * as React8 from "react";
import { Box as Box4, styled as styled6 } from "@elementor/ui";
var SelectionBadgeRoot = styled6(Box4, {
  shouldForwardProp: (prop) => "variant" !== prop
})(({ theme, variant }) => ({
  position: "absolute",
  top: theme.spacing(-1),
  insetInlineEnd: theme.spacing(-1),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: theme.spacing(2.25),
  height: theme.spacing(2.25),
  borderRadius: "50%",
  backgroundColor: variant === "paid" ? theme.palette.promotion.main : theme.palette.text.primary,
  color: theme.palette.common.white,
  "& .MuiSvgIcon-root": {
    fontSize: theme.typography.pxToRem(14)
  }
}));
function SelectionBadge({ icon: Icon, variant = "free" }) {
  return /* @__PURE__ */ React8.createElement(SelectionBadgeRoot, { variant }, /* @__PURE__ */ React8.createElement(Icon, null));
}

// src/components/site-about/styled-components.ts
import { Box as Box5, ButtonBase, styled as styled7 } from "@elementor/ui";
var OptionCardRoot = styled7(ButtonBase)(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(3),
  minWidth: 0,
  height: theme.spacing(16),
  padding: theme.spacing(2),
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  cursor: "pointer",
  transition: "border-color 150ms ease, background-color 150ms ease"
}));
var CardGrid = styled7(Box5)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(4, 132px)",
  gap: 16,
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "repeat(2, minmax(100px, 132px))"
  }
}));

// src/components/site-about/option-card.tsx
function OptionCard({ label, icon: Icon, selected, onClick }) {
  return /* @__PURE__ */ React9.createElement(
    OptionCardRoot,
    {
      className: selected ? "Mui-selected" : void 0,
      onClick,
      "aria-pressed": selected
    },
    selected && /* @__PURE__ */ React9.createElement(SelectionBadge, { icon: CheckIcon }),
    /* @__PURE__ */ React9.createElement(Icon, { sx: { fontSize: 32, color: "text.secondary" } }),
    /* @__PURE__ */ React9.createElement(Typography6, { variant: "body2", color: "text.secondary", align: "center" }, label)
  );
}

// src/components/site-about/options-grid.tsx
import * as React10 from "react";
function OptionsGrid({ selectedValues, onToggle }) {
  return /* @__PURE__ */ React10.createElement(CardGrid, null, SITE_ABOUT_OPTIONS.map((option) => /* @__PURE__ */ React10.createElement(
    OptionCard,
    {
      key: option.value,
      label: t(option.labelKey),
      icon: option.icon,
      selected: selectedValues.includes(option.value),
      onClick: () => onToggle(option.value)
    }
  )));
}

// src/steps/screens/site-about.tsx
function SiteAbout() {
  const { choices, actions } = useOnboarding();
  const selectedValues = useMemo3(
    () => Array.isArray(choices.site_about) ? choices.site_about : [],
    [choices.site_about]
  );
  const greetingText = useMemo3(() => {
    return getGreeting(choices.building_for ?? "");
  }, [choices.building_for]);
  const handleToggle = useCallback6(
    (value) => {
      const next = selectedValues.includes(value) ? selectedValues.filter((v) => v !== value) : [...selectedValues, value];
      actions.setUserChoice("site_about", next);
    },
    [selectedValues, actions]
  );
  return /* @__PURE__ */ React11.createElement(Stack5, { spacing: 7.5, "data-testid": "site-about-step" }, /* @__PURE__ */ React11.createElement(GreetingBanner, null, greetingText), /* @__PURE__ */ React11.createElement(Stack5, { spacing: 4, alignItems: "center" }, /* @__PURE__ */ React11.createElement(Stack5, { spacing: 1, alignItems: "center" }, /* @__PURE__ */ React11.createElement(StepTitle, { variant: "h5", align: "center" }, t("steps.site_about.title")), /* @__PURE__ */ React11.createElement(Typography7, { variant: "body1", color: "text.secondary", align: "center" }, t("steps.site_about.subtitle"))), /* @__PURE__ */ React11.createElement(OptionsGrid, { selectedValues, onToggle: handleToggle })));
}

// src/steps/screens/site-features.tsx
import * as React16 from "react";
import { useCallback as useCallback8, useMemo as useMemo4 } from "react";
import {
  CodeIcon,
  ColorSwatchIcon,
  ElementorAccessibilityIcon,
  ElementorAIIcon,
  ElementorEmailDeliverabilityIcon,
  ElementorImageOptimizerIcon,
  ThemeBuilderIcon
} from "@elementor/icons";
import { Stack as Stack7, Typography as Typography10 } from "@elementor/ui";

// src/components/ui/core-placeholder-icon.tsx
import * as React12 from "react";
import { SvgIcon as SvgIcon2 } from "@elementor/ui";
function CorePlaceholderIcon(props) {
  return /* @__PURE__ */ React12.createElement(SvgIcon2, { viewBox: "0 0 26 26", ...props }, /* @__PURE__ */ React12.createElement(
    "path",
    {
      d: "M12.0835 12.7497C12.0835 12.9265 12.1537 13.0961 12.2788 13.2211C12.4038 13.3461 12.5734 13.4163 12.7502 13.4163C12.927 13.4163 13.0965 13.3461 13.2216 13.2211C13.3466 13.0961 13.4168 12.9265 13.4168 12.7497C13.4168 12.5729 13.3466 12.4033 13.2216 12.2783C13.0965 12.1532 12.927 12.083 12.7502 12.083C12.5734 12.083 12.4038 12.1532 12.2788 12.2783C12.1537 12.4033 12.0835 12.5729 12.0835 12.7497Z",
      fill: "currentColor",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ), /* @__PURE__ */ React12.createElement(
    "path",
    {
      d: "M3.4165 12.7503C3.4165 13.976 3.65792 15.1897 4.12696 16.322C4.59601 17.4544 5.28349 18.4833 6.15017 19.35C7.01685 20.2167 8.04575 20.9042 9.17812 21.3732C10.3105 21.8422 11.5242 22.0837 12.7498 22.0837C13.9755 22.0837 15.1892 21.8422 16.3215 21.3732C17.4539 20.9042 18.4828 20.2167 19.3495 19.35C20.2162 18.4833 20.9037 17.4544 21.3727 16.322C21.8418 15.1897 22.0832 13.976 22.0832 12.7503C22.0832 11.5247 21.8418 10.311 21.3727 9.17861C20.9037 8.04624 20.2162 7.01734 19.3495 6.15066C18.4828 5.28398 17.4539 4.59649 16.3215 4.12745C15.1892 3.65841 13.9755 3.41699 12.7498 3.41699C11.5242 3.41699 10.3105 3.65841 9.17812 4.12745C8.04575 4.59649 7.01685 5.28398 6.15017 6.15066C5.28349 7.01734 4.59601 8.04624 4.12696 9.17861C3.65792 10.311 3.4165 11.5247 3.4165 12.7503Z",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ), /* @__PURE__ */ React12.createElement(
    "path",
    {
      d: "M12.75 0.75V3.41667",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ), /* @__PURE__ */ React12.createElement(
    "path",
    {
      d: "M0.75 12.75H3.41667",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ), /* @__PURE__ */ React12.createElement(
    "path",
    {
      d: "M12.75 22.083V24.7497",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ), /* @__PURE__ */ React12.createElement(
    "path",
    {
      d: "M22.0835 12.75H24.7502",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ));
}

// src/components/ui/woocommerce-icon.tsx
import * as React13 from "react";
import { SvgIcon as SvgIcon3 } from "@elementor/ui";
function WoocommerceIcon(props) {
  return /* @__PURE__ */ React13.createElement(SvgIcon3, { viewBox: "0 0 28 26", ...props }, /* @__PURE__ */ React13.createElement(
    "path",
    {
      d: "M15.7469 24.75V14.75C15.7469 14.4848 15.8523 14.2304 16.0398 14.0429C16.2273 13.8554 16.4817 13.75 16.7469 13.75H20.7469C21.0121 13.75 21.2665 13.8554 21.454 14.0429C21.6415 14.2304 21.7469 14.4848 21.7469 14.75V24.75M15.7469 24.75H0.893562M15.7469 24.75H21.7469M21.7469 24.75H26.6002M24.7469 24.75V9.21533M24.7469 9.21533C23.947 9.6768 23.0121 9.84739 22.1008 9.69818C21.1895 9.54897 20.3578 9.08913 19.7469 8.39667C19.0136 9.226 17.9416 9.75 16.7469 9.75C16.1793 9.75055 15.618 9.63 15.1007 9.39639C14.5834 9.16279 14.1218 8.82151 13.7469 8.39533C13.0136 9.226 11.9416 9.75 10.7469 9.75C10.1793 9.75055 9.61805 9.63 9.10072 9.39639C8.58338 9.16279 8.12184 8.82151 7.74689 8.39533C7.13612 9.08802 6.30455 9.5481 5.39322 9.69756C4.48189 9.84702 3.54692 9.67664 2.7469 9.21533M24.7469 9.21533C25.2784 8.90854 25.7321 8.48359 26.073 7.97335C26.414 7.46311 26.6329 6.88128 26.713 6.27287C26.793 5.66446 26.732 5.04579 26.5346 4.46473C26.3373 3.88368 26.0089 3.35582 25.5749 2.922L23.9882 1.33667C23.6135 0.961487 23.1051 0.750467 22.5749 0.75H4.91756C4.3875 0.750113 3.87916 0.960642 3.50423 1.33533L1.9189 2.922C1.48588 3.35632 1.15838 3.88427 0.961653 4.46516C0.764926 5.04605 0.704222 5.66436 0.784223 6.27242C0.864224 6.88048 1.08279 7.46205 1.42308 7.97228C1.76336 8.48252 2.21627 8.9078 2.7469 9.21533M2.7469 24.75V9.21533M6.74689 20.75H11.7469C12.0121 20.75 12.2665 20.6446 12.454 20.4571C12.6415 20.2696 12.7469 20.0152 12.7469 19.75V14.75C12.7469 14.4848 12.6415 14.2304 12.454 14.0429C12.2665 13.8554 12.0121 13.75 11.7469 13.75H6.74689C6.48168 13.75 6.22732 13.8554 6.03979 14.0429C5.85225 14.2304 5.74689 14.4848 5.74689 14.75V19.75C5.74689 20.302 6.19489 20.75 6.74689 20.75Z",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ));
}

// src/steps/components/site-features/feature-grid.tsx
import * as React14 from "react";
import { CheckIcon as CheckIcon2, CrownFilledIcon } from "@elementor/icons";
import { Box as Box6, Chip, styled as styled8, Typography as Typography8 } from "@elementor/ui";
var IncludedInCoreChip = styled8(Chip)(({ theme }) => ({
  position: "absolute",
  insetBlockStart: theme.spacing(0.75),
  insetInlineStart: theme.spacing(0.75),
  height: theme.spacing(2.25),
  "& .MuiChip-label": {
    fontSize: theme.spacing(1.5),
    padding: `${theme.spacing(0.375)} ${theme.spacing(1)}`
  }
}));
var FeatureCard = styled8(Box6, {
  shouldForwardProp: (prop) => !["isSelected", "isCore"].includes(prop)
})(({ theme, isSelected, isCore }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  aspectRatio: "1",
  minHeight: theme.spacing(12),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  border: isSelected ? `2px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
  cursor: isCore ? "default" : "pointer",
  transition: "border-color 0.2s ease, background-color 0.2s ease",
  ...!isCore && {
    "&:hover": {
      backgroundColor: theme.palette.action.hover
    }
  }
}));
function FeatureGrid({ options, selectedValues, onFeatureClick }) {
  const handleKeyDown = (event, handler) => {
    if (["Enter", " "].includes(event.key)) {
      event.preventDefault();
      handler();
    }
  };
  return /* @__PURE__ */ React14.createElement(
    Box6,
    {
      justifyContent: "center",
      sx: {
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(auto-fit, minmax(100px, 135px))",
          sm: "repeat(4, 1fr)",
          md: "repeat(5, 1fr)"
        },
        gap: 2,
        width: "100%"
      }
    },
    options.map((option) => {
      const isSelected = selectedValues.includes(option.id);
      const Icon = option.Icon;
      const BadgeIcon = option.licenseType !== "core" ? CrownFilledIcon : CheckIcon2;
      const isCore = option.licenseType === "core";
      const handleClick = () => onFeatureClick(option.id);
      const handleKeyDownEvent = isCore ? void 0 : (event) => handleKeyDown(event, handleClick);
      return /* @__PURE__ */ React14.createElement(
        FeatureCard,
        {
          key: option.id,
          "data-testid": `feature-card-${option.id}`,
          isSelected,
          isCore,
          onClick: isCore ? void 0 : handleClick,
          role: isCore ? void 0 : "button",
          tabIndex: isCore ? void 0 : 0,
          onKeyDown: handleKeyDownEvent,
          "aria-pressed": isCore ? void 0 : isSelected
        },
        isCore && /* @__PURE__ */ React14.createElement(IncludedInCoreChip, { label: t("steps.site_features.included"), size: "small" }),
        isSelected && /* @__PURE__ */ React14.createElement(
          SelectionBadge,
          {
            icon: BadgeIcon,
            variant: option.licenseType !== "core" ? "paid" : "free"
          }
        ),
        /* @__PURE__ */ React14.createElement(Box6, { className: "feature-icon", sx: { mb: 1 } }, /* @__PURE__ */ React14.createElement(Icon, { fontSize: "medium" })),
        /* @__PURE__ */ React14.createElement(Typography8, { variant: "body2", color: "text.secondary", textAlign: "center" }, t(option.labelKey))
      );
    })
  );
}

// src/steps/components/site-features/pro-plan-notice.tsx
import * as React15 from "react";
import { useCallback as useCallback7 } from "react";
import { InfoCircleIcon } from "@elementor/icons";
import { Box as Box7, Button as Button3, Stack as Stack6, styled as styled9, Typography as Typography9 } from "@elementor/ui";
var PRO_PLAN_NOTICE_BG = "rgba(250, 228, 250, 0.6)";
var ProPlanNoticeRoot = styled9(Box7)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  backgroundColor: PRO_PLAN_NOTICE_BG,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    justifyContent: "center"
  }
}));
function ProPlanNotice({ planName }) {
  const { urls } = useOnboarding();
  const comparePlansUrl = urls.comparePlans;
  const handleComparePlansClick = useCallback7(() => {
    window.open(comparePlansUrl, "_blank");
  }, [comparePlansUrl]);
  return /* @__PURE__ */ React15.createElement(ProPlanNoticeRoot, null, /* @__PURE__ */ React15.createElement(
    Stack6,
    {
      sx: (theme) => ({
        display: "flex",
        flexDirection: "row",
        gap: theme.spacing(1.5),
        alignItems: "center"
      })
    },
    /* @__PURE__ */ React15.createElement(
      InfoCircleIcon,
      {
        sx: (theme) => ({
          fontSize: theme.spacing(2.5),
          color: "text.secondary"
        })
      }
    ),
    /* @__PURE__ */ React15.createElement(
      Typography9,
      {
        variant: "body2",
        color: "text.secondary",
        sx: (theme) => ({
          fontSize: theme.spacing(1.625)
        })
      },
      t("steps.site_features.plan_recommendation_prefix"),
      " ",
      /* @__PURE__ */ React15.createElement("strong", null, planName),
      " ",
      t("steps.site_features.plan_recommendation_suffix")
    )
  ), /* @__PURE__ */ React15.createElement(
    Button3,
    {
      variant: "text",
      size: "small",
      color: "promotion",
      onClick: handleComparePlansClick,
      sx: (theme) => ({
        fontSize: theme.spacing(1.625),
        textTransform: "none",
        padding: theme.spacing(0.5, 0.625),
        minWidth: "auto"
      })
    },
    t("steps.site_features.compare_plans")
  ));
}

// src/steps/screens/site-features.tsx
var FEATURE_OPTIONS = [
  {
    id: "classes_variables",
    labelKey: "steps.site_features.option_classes_variables",
    Icon: (props) => /* @__PURE__ */ React16.createElement(ColorSwatchIcon, { ...props, sx: { transform: "rotate(90deg)" } }),
    licenseType: "core"
  },
  {
    id: "core_placeholder",
    labelKey: "steps.site_features.option_core_placeholder",
    Icon: CorePlaceholderIcon,
    licenseType: "core"
  },
  {
    id: "theme_builder",
    labelKey: "steps.site_features.option_theme_builder",
    Icon: ThemeBuilderIcon,
    licenseType: "pro"
  },
  {
    id: "lead_collection",
    labelKey: "steps.site_features.option_lead_collection",
    Icon: CorePlaceholderIcon,
    licenseType: "pro"
  },
  {
    id: "custom_code_css",
    labelKey: "steps.site_features.option_custom_code",
    Icon: CodeIcon,
    licenseType: "pro"
  },
  {
    id: "email_deliverability",
    labelKey: "steps.site_features.option_email_deliverability",
    Icon: ElementorEmailDeliverabilityIcon,
    licenseType: "one"
  },
  {
    id: "ai_features",
    labelKey: "steps.site_features.option_ai_generator",
    Icon: ElementorAIIcon,
    licenseType: "one"
  },
  {
    id: "image_optimization",
    labelKey: "steps.site_features.option_image_optimization",
    Icon: ElementorImageOptimizerIcon,
    licenseType: "one"
  },
  {
    id: "accessibility",
    labelKey: "steps.site_features.option_accessibility_tools",
    Icon: ElementorAccessibilityIcon,
    licenseType: "one"
  },
  {
    id: "woocommerce_builder",
    labelKey: "steps.site_features.woocommerce",
    Icon: WoocommerceIcon,
    licenseType: "pro"
  }
];
var CORE_FEATURE_IDS = new Set(
  FEATURE_OPTIONS.flatMap((option) => option.licenseType === "core" ? [option.id] : [])
);
var FEATURE_OPTION_IDS = new Set(FEATURE_OPTIONS.map((featureOption) => featureOption.id));
function SiteFeatures() {
  const { choices, actions } = useOnboarding();
  const storedPaidFeatures = useMemo4(
    () => (choices.site_features || []).filter((id) => FEATURE_OPTION_IDS.has(id)),
    [choices.site_features]
  );
  const selectedValues = useMemo4(() => {
    const combined = [...CORE_FEATURE_IDS, ...storedPaidFeatures];
    return combined.filter((id, index) => combined.indexOf(id) === index);
  }, [storedPaidFeatures]);
  const handleFeatureClick = useCallback8(
    (id) => {
      if (CORE_FEATURE_IDS.has(id) && selectedValues.includes(id)) {
        return;
      }
      const hasPaidFeaturesSelected = storedPaidFeatures.includes(id);
      const updatedPaidFeatureSelection = hasPaidFeaturesSelected ? storedPaidFeatures.filter((featureId) => featureId !== id) : [...storedPaidFeatures, id];
      actions.setUserChoice("site_features", updatedPaidFeatureSelection);
    },
    [storedPaidFeatures, selectedValues, actions]
  );
  const planName = useMemo4(() => {
    const hasOneFeature = storedPaidFeatures.some((optionId) => {
      const option = FEATURE_OPTIONS.find((featureOption) => featureOption.id === optionId);
      return option?.licenseType === "one";
    });
    return hasOneFeature ? "One" : "Pro";
  }, [storedPaidFeatures]);
  return /* @__PURE__ */ React16.createElement(
    Stack7,
    {
      spacing: 4,
      width: "100%",
      marginBottom: 10,
      "data-testid": "site-features-step",
      sx: (theme) => ({
        [theme.breakpoints.down("sm")]: {
          marginBottom: theme.spacing(10)
        }
      })
    },
    /* @__PURE__ */ React16.createElement(Stack7, { spacing: 1, textAlign: "center", alignItems: "center" }, /* @__PURE__ */ React16.createElement(Typography10, { variant: "h5", align: "center", fontWeight: 500 }, t("steps.site_features.title")), /* @__PURE__ */ React16.createElement(Typography10, { variant: "body1", color: "text.secondary" }, t("steps.site_features.subtitle"))),
    /* @__PURE__ */ React16.createElement(
      FeatureGrid,
      {
        options: FEATURE_OPTIONS,
        selectedValues,
        onFeatureClick: handleFeatureClick
      }
    ),
    storedPaidFeatures.length > 0 && /* @__PURE__ */ React16.createElement(ProPlanNotice, { planName })
  );
}

// src/steps/screens/theme-selection.tsx
import * as React18 from "react";
import { useCallback as useCallback9, useEffect as useEffect2, useMemo as useMemo5 } from "react";
import { Stack as Stack9, Typography as Typography12 } from "@elementor/ui";

// src/components/theme-selection/constants.ts
var HELLO_THEME = {
  slug: "hello-elementor",
  labelKey: "steps.theme_selection.theme_hello_label",
  descriptionKey: "steps.theme_selection.theme_hello_description",
  previewBgColor: "#f6f6f6",
  previewImage: getOnboardingAssetUrl("theme-hello.png")
};
var HELLO_BIZ_THEME = {
  slug: "hello-biz",
  labelKey: "steps.theme_selection.theme_hello_biz_label",
  descriptionKey: "steps.theme_selection.theme_hello_biz_description",
  previewBgColor: "#ffb8e5",
  previewImage: getOnboardingAssetUrl("theme-hello-biz.png")
};
function getRecommendedTheme(choices) {
  const buildingForQualifies = ["myself", "business"].includes(choices.building_for ?? "");
  const experienceQualifies = choices.experience_level === "beginner";
  const siteAboutQualifies = Array.isArray(choices.site_about) && choices.site_about.some((item) => ["local_services", "ecommerce"].includes(item));
  if ((buildingForQualifies || experienceQualifies) && siteAboutQualifies) {
    return "hello-biz";
  }
  return "hello-elementor";
}
function getGreetingText(experienceLevel) {
  if (experienceLevel === "beginner") {
    return t("steps.theme_selection.greeting_beginner");
  }
  return t("steps.theme_selection.greeting_default");
}

// src/components/theme-selection/theme-card.tsx
import * as React17 from "react";
import { CheckedCircleIcon } from "@elementor/icons";
import { Stack as Stack8, Typography as Typography11 } from "@elementor/ui";

// src/components/theme-selection/styled-components.ts
import { Box as Box8, Chip as Chip2, styled as styled10 } from "@elementor/ui";
var ThemeCardRoot = styled10(Box8, {
  shouldForwardProp: (prop) => !["selected", "disabled"].includes(prop)
})(({ theme, selected, disabled }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  paddingBlockEnd: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: selected ? `2px solid ${theme.palette.text.primary}` : `1px solid ${theme.palette.divider}`,
  cursor: disabled ? "default" : "pointer",
  inlineSize: theme.spacing(30),
  flexShrink: 0,
  position: "relative",
  overflow: "visible",
  opacity: disabled && !selected ? 0.5 : 1,
  transition: "border-color 150ms ease, opacity 150ms ease",
  ...!selected && !disabled && {
    "&:hover": {
      borderColor: theme.palette.text.secondary
    }
  }
}));
var ThemePreview = styled10(Box8, {
  shouldForwardProp: (prop) => !["bgColor", "previewImage"].includes(prop)
})(({ theme, bgColor, previewImage }) => ({
  inlineSize: "100%",
  blockSize: theme.spacing(14),
  overflow: "hidden",
  borderStartStartRadius: theme.spacing(1.75),
  borderStartEndRadius: theme.spacing(1.75),
  backgroundColor: bgColor,
  position: "relative",
  ...previewImage && {
    backgroundImage: `url(${previewImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center"
  }
}));
var InstalledChip = styled10(Chip2)(({ theme }) => ({
  position: "absolute",
  insetBlockStart: theme.spacing(1),
  insetInlineStart: theme.spacing(1),
  zIndex: 1,
  backgroundColor: theme.palette.success.main,
  color: theme.palette.success.contrastText,
  "& .MuiChip-icon": {
    color: "inherit"
  }
}));
var RecommendedChip = styled10(Chip2)(({ theme }) => ({
  position: "absolute",
  insetBlockStart: theme.spacing(1),
  insetInlineStart: theme.spacing(1),
  zIndex: 1
}));

// src/components/theme-selection/theme-card.tsx
function ThemeCard({
  slug,
  label,
  description,
  previewBgColor,
  previewImage,
  selected,
  recommended,
  installed,
  disabled,
  onClick
}) {
  return /* @__PURE__ */ React17.createElement(
    ThemeCardRoot,
    {
      selected,
      disabled,
      onClick: () => !disabled && onClick(slug),
      role: "radio",
      "aria-checked": selected,
      "aria-label": label,
      tabIndex: 0,
      onKeyDown: (e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          onClick(slug);
        }
      }
    },
    /* @__PURE__ */ React17.createElement(ThemePreview, { bgColor: previewBgColor, previewImage }, installed && /* @__PURE__ */ React17.createElement(
      InstalledChip,
      {
        label: t("common.installed"),
        size: "small",
        color: "success",
        icon: /* @__PURE__ */ React17.createElement(CheckedCircleIcon, null)
      }
    ), recommended && !installed && /* @__PURE__ */ React17.createElement(RecommendedChip, { label: t("common.recommended"), size: "small", color: "secondary" })),
    /* @__PURE__ */ React17.createElement(Stack8, { spacing: 1, alignItems: "center", sx: { textAlign: "center", px: 2.25 } }, /* @__PURE__ */ React17.createElement(Typography11, { variant: "subtitle1", color: "text.primary" }, label), /* @__PURE__ */ React17.createElement(Typography11, { variant: "body2", color: "text.secondary" }, description))
  );
}

// src/steps/screens/theme-selection.tsx
function ThemeSelection({ onComplete }) {
  const { choices, completedSteps, actions } = useOnboarding();
  const selectedValue = choices.theme_selection;
  const isStepCompleted = completedSteps.includes(StepId.THEME_SELECTION);
  const isInstalled = isStepCompleted && !!selectedValue;
  const recommendedTheme = useMemo5(() => getRecommendedTheme(choices), [choices]);
  const greetingText = useMemo5(() => getGreetingText(choices.experience_level), [choices.experience_level]);
  const showBothThemes = true;
  useEffect2(() => {
    if (!selectedValue) {
      actions.setUserChoice("theme_selection", recommendedTheme);
    }
  }, [selectedValue, recommendedTheme]);
  const handleSelect = useCallback9(
    (slug) => {
      if (isInstalled) {
        onComplete({ theme_selection: selectedValue });
        return;
      }
      actions.setUserChoice("theme_selection", slug);
    },
    [actions, isInstalled, onComplete, selectedValue]
  );
  const themes = useMemo5(
    () => showBothThemes ? [HELLO_THEME, HELLO_BIZ_THEME] : [HELLO_THEME],
    [showBothThemes]
  );
  const effectiveSelection = selectedValue ?? recommendedTheme;
  return /* @__PURE__ */ React18.createElement(Stack9, { spacing: 7.5, "data-testid": "theme-selection-step" }, /* @__PURE__ */ React18.createElement(GreetingBanner, null, greetingText), /* @__PURE__ */ React18.createElement(Stack9, { spacing: 4 }, /* @__PURE__ */ React18.createElement(Stack9, { spacing: 1 }, /* @__PURE__ */ React18.createElement(StepTitle, { variant: "h5", align: "center" }, t("steps.theme_selection.title")), /* @__PURE__ */ React18.createElement(Typography12, { variant: "body1", color: "text.secondary" }, t("steps.theme_selection.subtitle"))), /* @__PURE__ */ React18.createElement(
    Stack9,
    {
      direction: "row",
      spacing: 4,
      role: "radiogroup",
      "aria-label": t("steps.theme_selection.aria_label")
    },
    themes.map((theme) => {
      const isSelected = effectiveSelection === theme.slug;
      const isThemeInstalled = isInstalled && selectedValue === theme.slug;
      const isRecommended = theme.slug === recommendedTheme;
      return /* @__PURE__ */ React18.createElement(
        ThemeCard,
        {
          key: theme.slug,
          slug: theme.slug,
          label: t(theme.labelKey),
          description: t(theme.descriptionKey),
          previewBgColor: theme.previewBgColor,
          previewImage: theme.previewImage,
          selected: isSelected,
          recommended: isRecommended,
          installed: isThemeInstalled,
          disabled: isInstalled && !isSelected,
          onClick: handleSelect
        }
      );
    })
  )));
}

// src/components/ui/base-layout.tsx
import * as React19 from "react";
import { Box as Box9, styled as styled11 } from "@elementor/ui";
var TOPBAR_HEIGHT = 40;
var FOOTER_HEIGHT = 72;
var LayoutRoot = styled11(Box9)(({ theme }) => ({
  position: "fixed",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  background: theme.palette.background.default,
  zIndex: theme.zIndex?.modal || 1300
}));
var ContentArea = styled11(Box9, {
  shouldForwardProp: (prop) => !["topBarHeight", "footerHeight"].includes(prop)
})(({ topBarHeight, footerHeight }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  paddingTop: topBarHeight,
  paddingBottom: footerHeight
}));
function BaseLayout({ children, topBar, footer, testId }) {
  const topBarHeight = topBar ? TOPBAR_HEIGHT : 0;
  const footerHeight = footer ? FOOTER_HEIGHT : 0;
  return /* @__PURE__ */ React19.createElement(LayoutRoot, { "data-testid": testId }, topBar, /* @__PURE__ */ React19.createElement(ContentArea, { topBarHeight, footerHeight }, children), footer);
}

// src/components/ui/completion-screen.tsx
import * as React20 from "react";
import { Box as Box10, Stack as Stack10, styled as styled12, Typography as Typography13 } from "@elementor/ui";
var PROGRESS_BAR_WIDTH = 192;
var ProgressTrack = styled12(Box10)(({ theme }) => ({
  width: PROGRESS_BAR_WIDTH,
  height: 4,
  borderRadius: 22,
  backgroundColor: theme.palette.action.hover,
  position: "relative",
  overflow: "hidden"
}));
var FAKE_PROGRESS_KEYFRAMES = {
  "0%": { width: "0%" },
  "30%": { width: "35%" },
  "60%": { width: "55%" },
  "80%": { width: "68%" },
  "100%": { width: "75%" }
};
var ProgressFill = styled12(Box10)(({ theme }) => ({
  position: "absolute",
  left: 0,
  top: 0,
  height: "100%",
  borderRadius: 22,
  backgroundColor: theme.palette.text.primary,
  animation: "e-onboarding-fake-progress 3s ease-out forwards",
  "@keyframes e-onboarding-fake-progress": FAKE_PROGRESS_KEYFRAMES
}));
function CompletionScreen() {
  return /* @__PURE__ */ React20.createElement(
    Box10,
    {
      sx: {
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.paper"
      }
    },
    /* @__PURE__ */ React20.createElement(Stack10, { spacing: 4, alignItems: "center", sx: { maxWidth: 463, width: "100%", px: 3 } }, /* @__PURE__ */ React20.createElement(ProgressTrack, null, /* @__PURE__ */ React20.createElement(ProgressFill, null)), /* @__PURE__ */ React20.createElement(Stack10, { spacing: 1, textAlign: "center" }, /* @__PURE__ */ React20.createElement(Typography13, { variant: "h5", fontWeight: 500, color: "text.primary" }, t("completion.title")), /* @__PURE__ */ React20.createElement(Typography13, { variant: "body1", color: "text.secondary" }, t("completion.subtitle"))))
  );
}

// src/components/ui/footer.tsx
import * as React21 from "react";
import { Box as Box11, styled as styled13 } from "@elementor/ui";
var FooterRoot = styled13(Box11)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: FOOTER_HEIGHT,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2, 3),
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  zIndex: theme.zIndex?.appBar || 1100
}));
function Footer({ children }) {
  return /* @__PURE__ */ React21.createElement(FooterRoot, { component: "footer" }, children);
}

// src/components/ui/footer-actions.tsx
import * as React22 from "react";
import { ArrowLeftIcon } from "@elementor/icons";
import { Box as Box12, Button as Button4, styled as styled14 } from "@elementor/ui";
var LeftActions = styled14(Box12)({
  display: "flex",
  alignItems: "center",
  gap: 8
});
var RightActions = styled14(Box12)({
  display: "flex",
  alignItems: "center",
  gap: 8
});
var BackButton = styled14(Button4)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: theme.spacing(0.75, 1),
  minHeight: 0,
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontSize: theme.typography.pxToRem(14),
  fontWeight: 500,
  lineHeight: theme.typography.pxToRem(24),
  letterSpacing: "0.4px",
  "&:hover": {
    backgroundColor: "transparent"
  }
}));
var SkipButton = styled14(Button4)(({ theme }) => {
  const outlinedBorderColor = theme.palette.primary?.states?.outlinedBorder ?? theme.palette.divider;
  return {
    color: theme.palette.text.primary,
    borderColor: outlinedBorderColor,
    padding: theme.spacing(0.75, 2),
    minHeight: 0,
    borderRadius: theme.shape.borderRadius,
    textTransform: "none",
    fontSize: theme.typography.pxToRem(14),
    fontWeight: 500,
    lineHeight: theme.typography.pxToRem(24),
    letterSpacing: "0.4px",
    "&:hover": {
      backgroundColor: "transparent",
      borderColor: outlinedBorderColor
    }
  };
});
var ContinueButton = styled14(Button4)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(0.75, 2),
  minHeight: 0,
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontSize: theme.typography.pxToRem(14),
  fontWeight: 500,
  lineHeight: theme.typography.pxToRem(24),
  letterSpacing: "0.4px",
  "&:hover": {
    backgroundColor: theme.palette.primary.main
  }
}));
function FooterActions({
  showBack = true,
  showSkip = true,
  showContinue = true,
  backLabel = t("common.back"),
  skipLabel = t("common.skip"),
  continueLabel = t("common.continue"),
  continueDisabled = false,
  continueLoading = false,
  onBack,
  onSkip,
  onContinue
}) {
  return /* @__PURE__ */ React22.createElement(React22.Fragment, null, /* @__PURE__ */ React22.createElement(LeftActions, null, showBack && /* @__PURE__ */ React22.createElement(BackButton, { variant: "text", onClick: onBack, startIcon: /* @__PURE__ */ React22.createElement(ArrowLeftIcon, { fontSize: "tiny" }) }, backLabel)), /* @__PURE__ */ React22.createElement(RightActions, null, showSkip && /* @__PURE__ */ React22.createElement(SkipButton, { variant: "outlined", onClick: onSkip }, skipLabel), showContinue && /* @__PURE__ */ React22.createElement(
    ContinueButton,
    {
      variant: "contained",
      onClick: onContinue,
      disabled: continueDisabled || continueLoading
    },
    continueLoading ? t("common.loading") : continueLabel
  )));
}

// src/components/ui/split-layout.tsx
import * as React25 from "react";
import { Box as Box14, styled as styled17 } from "@elementor/ui";

// src/components/ui/progress-bar.tsx
import * as React23 from "react";
import { LinearProgress, styled as styled15 } from "@elementor/ui";
var StyledLinearProgress = styled15(LinearProgress)(({ theme }) => ({
  height: 4,
  borderRadius: 22,
  backgroundColor: theme.palette.action.hover,
  "& .MuiLinearProgress-bar": {
    borderRadius: 22,
    backgroundColor: theme.palette.text.primary
  }
}));
function ProgressBar({ currentStep, totalSteps }) {
  const progress = totalSteps > 0 ? (currentStep + 1) / totalSteps * 100 : 0;
  return /* @__PURE__ */ React23.createElement(StyledLinearProgress, { variant: "determinate", value: progress });
}

// src/components/ui/right-panel.tsx
import * as React24 from "react";
import { useEffect as useEffect3, useState } from "react";
import { Box as Box13, styled as styled16 } from "@elementor/ui";
var ANIMATION_DURATION_MS = 400;
var ANIMATION_OFFSET_PX = 24;
var PANEL_RADIUS_MULTIPLIER = 2;
var PANEL_MIN_HEIGHT = 36;
var RightPanelRoot = styled16(Box13, {
  shouldForwardProp: (prop) => prop !== "background"
})(({ theme, background }) => ({
  position: "relative",
  width: "100%",
  height: "100%",
  minHeight: theme.spacing(PANEL_MIN_HEIGHT),
  borderRadius: theme.shape.borderRadius * PANEL_RADIUS_MULTIPLIER,
  overflow: "hidden",
  background
}));
var AssetImage = styled16("img")({
  position: "absolute",
  maxWidth: "100%",
  height: "auto",
  transition: `opacity ${ANIMATION_DURATION_MS}ms ease, transform ${ANIMATION_DURATION_MS}ms ease`
});
var getAnimationStyle = (animation, isVisible) => {
  if (animation === "none") {
    return {
      opacity: 1,
      transform: "translateY(0)"
    };
  }
  const opacity = isVisible ? 1 : 0;
  const transform = animation === "fade-up" ? `translateY(${isVisible ? 0 : ANIMATION_OFFSET_PX}px)` : "translateY(0)";
  return { opacity, transform };
};
var RightPanelAssetItem = React24.memo(function RightPanelAssetItem2({ asset }) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect3(() => {
    setIsVisible(true);
  }, []);
  const animation = asset.animation ?? "fade-in";
  const animationStyle = getAnimationStyle(animation, isVisible);
  return /* @__PURE__ */ React24.createElement(
    AssetImage,
    {
      src: asset.src,
      alt: asset.alt ?? "",
      "aria-hidden": !asset.alt,
      draggable: false,
      style: { ...asset.style, ...animationStyle }
    }
  );
});
var RightPanel = React24.memo(function RightPanel2({ config }) {
  return /* @__PURE__ */ React24.createElement(RightPanelRoot, { background: config.background }, config.assets.map((asset) => /* @__PURE__ */ React24.createElement(RightPanelAssetItem, { key: asset.id, asset })));
});

// src/components/ui/split-layout.tsx
var LAYOUT_RATIOS = {
  wide: { left: 1, right: 1 },
  narrow: { left: 3, right: 1 }
};
var LAYOUT_GAP = 4;
var LAYOUT_PADDING = 4;
var LAYOUT_TRANSITION_MS = 300;
var LEFT_PANEL_CONTENT_WIDTH = 386;
var LEFT_PANEL_PADDING_X = 80;
var LEFT_PANEL_PADDING_TOP = 40;
var LEFT_PANEL_GAP = 32;
var IMAGE_MIN_WIDTH = 464;
var CONTENT_IMAGE_MIN_GAP = 80;
var SplitLayoutRoot = styled17(Box14, {
  shouldForwardProp: (prop) => !["leftRatio", "rightRatio"].includes(prop)
})(({ theme, leftRatio, rightRatio }) => {
  const hideImageBreakpoint = LEFT_PANEL_CONTENT_WIDTH + LEFT_PANEL_PADDING_X * 2 + CONTENT_IMAGE_MIN_GAP + IMAGE_MIN_WIDTH + LAYOUT_GAP * 8;
  return {
    flex: 1,
    display: "grid",
    gridTemplateColumns: `${leftRatio}fr ${rightRatio}fr`,
    gap: theme.spacing(LAYOUT_GAP),
    padding: theme.spacing(LAYOUT_PADDING),
    minHeight: 0,
    transition: `grid-template-columns ${LAYOUT_TRANSITION_MS}ms ease`,
    [`@media (max-width: ${hideImageBreakpoint}px)`]: {
      gridTemplateColumns: "1fr",
      "& > *:last-child": {
        display: "none"
      }
    }
  };
});
var LeftPanel = styled17(Box14, {
  shouldForwardProp: (prop) => "contentMaxWidth" !== prop
})(({ theme, contentMaxWidth }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: LEFT_PANEL_GAP,
  padding: `${LEFT_PANEL_PADDING_TOP}px ${LEFT_PANEL_PADDING_X}px`,
  "& > *": {
    width: "100%"
  },
  "& > *:last-of-type": {
    maxWidth: contentMaxWidth
  },
  [theme.breakpoints.down("sm")]: {
    padding: 0,
    gap: LEFT_PANEL_GAP / 2,
    "& > *": {
      maxWidth: "none"
    }
  }
}));
function SplitLayout({ left, rightConfig, progress }) {
  const ratio = LAYOUT_RATIOS[rightConfig.imageLayout] ?? LAYOUT_RATIOS.wide;
  const contentMaxWidth = rightConfig.contentMaxWidth ?? LEFT_PANEL_CONTENT_WIDTH;
  return /* @__PURE__ */ React25.createElement(SplitLayoutRoot, { leftRatio: ratio.left, rightRatio: ratio.right }, /* @__PURE__ */ React25.createElement(LeftPanel, { contentMaxWidth }, progress && /* @__PURE__ */ React25.createElement(Box14, { sx: { maxWidth: LEFT_PANEL_CONTENT_WIDTH, width: "100%" } }, /* @__PURE__ */ React25.createElement(ProgressBar, { currentStep: progress.currentStep, totalSteps: progress.totalSteps })), left), /* @__PURE__ */ React25.createElement(RightPanel, { config: rightConfig }));
}

// src/components/ui/top-bar.tsx
import * as React26 from "react";
import { Box as Box15, styled as styled18 } from "@elementor/ui";
var TopBarRoot = styled18(Box15)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: TOPBAR_HEIGHT,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingInlineStart: 41,
  paddingInlineEnd: 16,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  zIndex: theme.zIndex?.appBar || 1100
}));
function TopBar({ children }) {
  return /* @__PURE__ */ React26.createElement(TopBarRoot, { component: "header" }, children);
}

// src/components/ui/top-bar-content.tsx
import * as React30 from "react";
import { XIcon } from "@elementor/icons";
import { Button as Button5, IconButton, Stack as Stack12, styled as styled19, useTheme as useTheme2 } from "@elementor/ui";

// src/components/ui/elementor-logo.tsx
import * as React29 from "react";
import { Stack as Stack11, useTheme } from "@elementor/ui";

// src/components/ui/elementor-icon.tsx
import * as React27 from "react";
import { SvgIcon as SvgIcon4 } from "@elementor/ui";
function ElementorIcon(props) {
  return /* @__PURE__ */ React27.createElement(SvgIcon4, { viewBox: "0 0 32 32", ...props }, /* @__PURE__ */ React27.createElement(
    "path",
    {
      d: "M15.93 0C7.13 0 0 7.16 0 16s7.13 16 15.93 16c8.8 0 15.93-7.16 15.93-16S24.73 0 15.93 0zM11.15 24H7.97V8h3.18v16zm12.74 0h-9.56v-3.2h9.56V24zm0-6.4h-9.56v-3.2h9.56v3.2zm0-6.4h-9.56V8h9.56v3.2z",
      fill: "currentColor"
    }
  ));
}

// src/components/ui/elementor-wordmark.tsx
import * as React28 from "react";
import { SvgIcon as SvgIcon5 } from "@elementor/ui";
function ElementorWordmark(props) {
  return /* @__PURE__ */ React28.createElement(SvgIcon5, { viewBox: "0 0 90 15", ...props }, /* @__PURE__ */ React28.createElement(
    "path",
    {
      d: "M2.96457 11.7721C3.50632 12.322 4.19354 12.5969 5.01619 12.5969C5.70843 12.5969 6.27526 12.4519 6.71668 12.162C7.16313 11.8721 7.44905 11.4622 7.58449 10.9323H9.69631C9.51071 11.977 8.99404 12.8119 8.14129 13.4417C7.29355 14.0716 6.25018 14.3815 5.01619 14.3815C4.02299 14.3815 3.15017 14.1666 2.39774 13.7367C1.65033 13.3068 1.06343 12.7269 0.64709 12.002C0.230745 11.2772 0.0150486 10.4874 0 9.64254H2.05162C2.11683 10.5174 2.42282 11.2272 2.96959 11.7771L2.96457 11.7721ZM2.01149 8.98768C2.01149 8.76273 2.03657 8.46779 2.09175 8.09287H7.48416C7.42898 7.37802 7.16814 6.80314 6.69662 6.36823C6.2251 5.93333 5.59807 5.71337 4.81555 5.71337C4.08318 5.71337 3.48625 5.92333 3.01473 6.34824C2.54321 6.77315 2.23722 7.35303 2.08674 8.09287H0.0351132C0.155502 7.33803 0.42136 6.65317 0.832688 6.0383C1.24402 5.42343 1.79078 4.93854 2.47298 4.58861C3.15519 4.23868 3.93771 4.06372 4.81053 4.06372C5.83383 4.06372 6.70665 4.28367 7.42898 4.72858C8.15131 5.17349 8.69808 5.75336 9.05925 6.47321C9.42543 7.19306 9.60601 7.98289 9.60601 8.84271C9.60601 9.08266 9.59096 9.3476 9.56588 9.63754H2.04159C2.01651 9.32261 2.00146 9.10266 2.00146 8.98268L2.01149 8.98768Z",
      fill: "currentColor"
    }
  ), /* @__PURE__ */ React28.createElement("path", { d: "M11.0857 1.82461H9.49561V0H13.2176V14.222H11.0857V1.82461Z", fill: "currentColor" }), /* @__PURE__ */ React28.createElement(
    "path",
    {
      d: "M17.3762 11.7721C17.9179 12.322 18.6052 12.5969 19.4278 12.5969C20.12 12.5969 20.6869 12.4519 21.1283 12.162C21.5747 11.8721 21.8607 11.4622 21.9961 10.9323H24.1079C23.9223 11.977 23.4057 12.8119 22.5529 13.4417C21.7052 14.0716 20.6618 14.3815 19.4278 14.3815C18.4346 14.3815 17.5618 14.1666 16.8094 13.7367C16.0619 13.3068 15.4751 12.7269 15.0587 12.002C14.6424 11.2772 14.4267 10.4874 14.4116 9.64254H16.4632C16.5285 10.5174 16.8344 11.2272 17.3812 11.7771L17.3762 11.7721ZM16.4231 8.98768C16.4231 8.76273 16.4482 8.46779 16.5034 8.09287H21.8958C21.8406 7.37802 21.5798 6.80314 21.1082 6.36823C20.6367 5.93333 20.0097 5.71337 19.2272 5.71337C18.4948 5.71337 17.8979 5.92333 17.4264 6.34824C16.9548 6.77315 16.6488 7.35303 16.4984 8.09287H14.4467C14.5671 7.33803 14.833 6.65317 15.2443 6.0383C15.6556 5.42343 16.2024 4.93854 16.8846 4.58861C17.5668 4.23868 18.3493 4.06372 19.2221 4.06372C20.2455 4.06372 21.1183 4.28367 21.8406 4.72858C22.5629 5.17349 23.1097 5.75336 23.4709 6.47321C23.837 7.19306 24.0176 7.98289 24.0176 8.84271C24.0176 9.08266 24.0026 9.3476 23.9775 9.63754H16.4532C16.4281 9.32261 16.4131 9.10266 16.4131 8.98268L16.4231 8.98768Z",
      fill: "currentColor"
    }
  ), /* @__PURE__ */ React28.createElement(
    "path",
    {
      d: "M26.1243 6.03319H24.5342V4.22857H28.2361V5.91321C28.4769 5.34333 28.8531 4.89343 29.3698 4.5635C29.8865 4.23357 30.5034 4.0686 31.2208 4.0686C31.9782 4.0686 32.6454 4.24857 33.2222 4.60349C33.7991 4.95842 34.1853 5.44831 34.386 6.07318C34.6117 5.4933 35.0331 5.0134 35.6501 4.63348C36.2671 4.25856 36.9392 4.0686 37.6716 4.0686C38.7601 4.0686 39.6229 4.41353 40.2599 5.09839C40.897 5.78824 41.213 6.69805 41.213 7.83781V14.2265H39.1012V8.43268C39.1012 7.66784 38.9156 7.05297 38.5444 6.58807C38.1732 6.12317 37.6766 5.89322 37.0496 5.89322C36.3473 5.89322 35.7805 6.17316 35.3591 6.72804C34.9327 7.28292 34.7221 7.95778 34.7221 8.75261V14.2265H32.5902V8.43268C32.5902 7.66784 32.4096 7.05297 32.0434 6.58807C31.6772 6.12317 31.1857 5.89322 30.5586 5.89322C29.8664 5.89322 29.3096 6.17316 28.8782 6.73804C28.4468 7.29792 28.2311 7.97278 28.2311 8.75261V14.2265H26.1193V6.03319H26.1243Z",
      fill: "currentColor"
    }
  ), /* @__PURE__ */ React28.createElement(
    "path",
    {
      d: "M45.3518 11.7721C45.8935 12.322 46.5807 12.5969 47.4034 12.5969C48.0956 12.5969 48.6625 12.4519 49.1039 12.162C49.5503 11.8721 49.8363 11.4622 49.9717 10.9323H52.0835C51.8979 11.977 51.3812 12.8119 50.5285 13.4417C49.6808 14.0716 48.6374 14.3815 47.4034 14.3815C46.4102 14.3815 45.5374 14.1666 44.7849 13.7367C44.0375 13.3068 43.4506 12.7269 43.0343 12.002C42.6179 11.2772 42.4023 10.4874 42.3872 9.64254H44.4388C44.504 10.5174 44.81 11.2272 45.3568 11.7771L45.3518 11.7721ZM44.3987 8.98768C44.3987 8.76273 44.4238 8.46779 44.479 8.09287H49.8714C49.8162 7.37802 49.5554 6.80314 49.0838 6.36823C48.6123 5.93333 47.9853 5.71337 47.2028 5.71337C46.4704 5.71337 45.8735 5.92333 45.4019 6.34824C44.9304 6.77315 44.6244 7.35303 44.4739 8.09287H42.4223C42.5427 7.33803 42.8086 6.65317 43.2199 6.0383C43.6312 5.42343 44.178 4.93854 44.8602 4.58861C45.5424 4.23868 46.3249 4.06372 47.1977 4.06372C48.221 4.06372 49.0939 4.28367 49.8162 4.72858C50.5385 5.17349 51.0853 5.75336 51.4465 6.47321C51.8126 7.19306 51.9932 7.98289 51.9932 8.84271C51.9932 9.08266 51.9782 9.3476 51.9531 9.63754H44.4288C44.4037 9.32261 44.3887 9.10266 44.3887 8.98268L44.3987 8.98768Z",
      fill: "currentColor"
    }
  ), /* @__PURE__ */ React28.createElement(
    "path",
    {
      d: "M54.0144 6.03319H52.4243V4.22857H56.1263V5.91321C56.3921 5.31834 56.8085 4.86344 57.3703 4.5435C57.9321 4.22857 58.5892 4.0686 59.3316 4.0686C60.4603 4.0686 61.3632 4.43353 62.0504 5.16837C62.7326 5.90322 63.0737 6.86301 63.0737 8.05276V14.2215H60.9418V8.48767C60.9418 7.73283 60.7362 7.12796 60.3248 6.66305C59.9135 6.19815 59.3717 5.9682 58.6946 5.9682C57.9522 5.9682 57.3352 6.23315 56.8536 6.76303C56.367 7.29292 56.1263 7.96778 56.1263 8.78761V14.2215H54.0144V6.03319Z",
      fill: "currentColor"
    }
  ), /* @__PURE__ */ React28.createElement(
    "path",
    {
      d: "M66.8009 13.3318C66.1839 12.7369 65.8729 11.9171 65.8729 10.8723V6.03336H63.8413V4.22875H65.8729V1.1344H67.9847V4.22875H70.8891V6.03336H67.9847V10.7924C67.9847 11.3072 68.1201 11.7072 68.391 11.9921C68.6619 12.277 69.0381 12.417 69.5146 12.417H70.8891V14.2216H69.2989C68.2505 14.2216 67.4179 13.9217 66.8009 13.3268V13.3318Z",
      fill: "currentColor"
    }
  ), /* @__PURE__ */ React28.createElement(
    "path",
    {
      d: "M74.024 13.7167C73.2364 13.2718 72.6195 12.6619 72.173 11.8821C71.7266 11.1022 71.5059 10.2174 71.5059 9.22263C71.5059 8.22784 71.7266 7.34303 72.173 6.56319C72.6195 5.78336 73.2364 5.17349 74.024 4.72858C74.8115 4.28367 75.7044 4.06372 76.7026 4.06372C77.7009 4.06372 78.5887 4.28367 79.3813 4.72858C80.1688 5.17349 80.7858 5.78336 81.2323 6.56319C81.6787 7.34303 81.8994 8.22784 81.8994 9.22263C81.8994 10.2174 81.6787 11.1022 81.2323 11.8821C80.7858 12.6619 80.1688 13.2718 79.3813 13.7167C78.5937 14.1616 77.7009 14.3815 76.7026 14.3815C75.7044 14.3815 74.8165 14.1616 74.024 13.7167ZM78.8997 11.6171C79.4615 11.0023 79.7475 10.2074 79.7475 9.22763C79.7475 8.24784 79.4666 7.453 78.8997 6.83813C78.3379 6.22326 77.6005 5.91333 76.7026 5.91333C75.8047 5.91333 75.0724 6.21827 74.5106 6.83813C73.9538 7.453 73.6729 8.24784 73.6729 9.22763C73.6729 10.2074 73.9538 11.0023 74.5106 11.6171C75.0674 12.232 75.7997 12.5419 76.7026 12.5419C77.6056 12.5419 78.3379 12.237 78.8997 11.6171Z",
      fill: "currentColor"
    }
  ), /* @__PURE__ */ React28.createElement(
    "path",
    {
      d: "M83.8411 6.03362H82.251V4.229H85.9529V6.09361C86.1937 5.44375 86.5198 4.97385 86.9361 4.67391C87.3524 4.37397 87.9092 4.229 88.5965 4.229H89.7903V6.03362H88.2955C87.4728 6.03362 86.8759 6.35355 86.5047 6.99342C86.1335 7.63328 85.9479 8.5131 85.9479 9.62286V14.2269H83.8361V6.03362H83.8411Z",
      fill: "currentColor"
    }
  ));
}

// src/components/ui/elementor-logo.tsx
function ElementorLogo({ height = 20, sx, ...props }) {
  const theme = useTheme();
  const iconSize = height;
  const wordmarkHeight = height * 0.8;
  const wordmarkWidth = wordmarkHeight * 6;
  return /* @__PURE__ */ React29.createElement(
    Stack11,
    {
      direction: "row",
      alignItems: "center",
      spacing: 0.5,
      sx: {
        color: theme.palette.text.primary,
        ...sx
      },
      ...props
    },
    /* @__PURE__ */ React29.createElement(ElementorIcon, { sx: { width: iconSize, height: iconSize } }),
    /* @__PURE__ */ React29.createElement(ElementorWordmark, { sx: { width: wordmarkWidth, height: wordmarkHeight } })
  );
}

// src/components/ui/top-bar-content.tsx
var UpgradeButton = styled19(Button5)(({ theme }) => ({
  backgroundColor: theme.palette.promotion.main,
  color: theme.palette.promotion.contrastText,
  padding: theme.spacing(0.5, 1.25),
  minHeight: 0,
  borderRadius: 8,
  textTransform: "none",
  fontSize: theme.typography.pxToRem(13),
  fontWeight: 500,
  lineHeight: theme.typography.pxToRem(22),
  letterSpacing: "0.46px",
  "&:hover": {
    backgroundColor: theme.palette.promotion.main
  }
}));
var Divider2 = styled19("div")(({ theme }) => ({
  width: 2,
  height: 20,
  backgroundColor: theme.palette.divider
}));
function TopBarContent({ showUpgrade = true, showClose = true, onUpgrade, onClose }) {
  const theme = useTheme2();
  return /* @__PURE__ */ React30.createElement(React30.Fragment, null, /* @__PURE__ */ React30.createElement(ElementorLogo, { height: 20 }), /* @__PURE__ */ React30.createElement(Stack12, { direction: "row", alignItems: "center", spacing: 2 }, showUpgrade && /* @__PURE__ */ React30.createElement(UpgradeButton, { variant: "contained", onClick: onUpgrade }, t("common.upgrade")), showClose && /* @__PURE__ */ React30.createElement(Stack12, { direction: "row", alignItems: "center", spacing: 1.5 }, /* @__PURE__ */ React30.createElement(Divider2, null), /* @__PURE__ */ React30.createElement(
    IconButton,
    {
      "aria-label": t("common.close_onboarding"),
      onClick: onClose,
      size: "small",
      sx: {
        color: theme.palette.text.secondary,
        padding: 0
      }
    },
    /* @__PURE__ */ React30.createElement(XIcon, { fontSize: "tiny" })
  ))));
}

// src/components/app-content.tsx
var isChoiceEmpty = (choice) => {
  return choice === null || choice === void 0 || Array.isArray(choice) && choice.length === 0;
};
function AppContent({ onClose }) {
  const {
    stepId,
    stepIndex,
    isFirst,
    isLast,
    totalSteps,
    hadUnexpectedExit,
    isLoading,
    hasPassedLogin,
    shouldShowProInstall,
    choices,
    completedSteps,
    urls,
    actions
  } = useOnboarding();
  const [isCompleting, setIsCompleting] = useState2(false);
  const updateProgress2 = useUpdateProgress();
  const updateChoices2 = useUpdateChoices();
  useEffect4(() => {
    if (hadUnexpectedExit) {
      actions.clearUnexpectedExit();
    }
  }, [hadUnexpectedExit, actions]);
  const checkProInstallScreen = useCheckProInstallScreen();
  const handleConnectSuccess = useCallback10(async () => {
    const result = await checkProInstallScreen();
    actions.setShouldShowProInstallScreen(result.shouldShowProInstallScreen);
    actions.setConnected(true);
  }, [actions, checkProInstallScreen]);
  const handleConnect = useElementorConnect({
    connectUrl: urls.connect,
    onSuccess: handleConnectSuccess
  });
  const handleContinueAsGuest = useCallback10(() => {
    actions.setGuest(true);
  }, [actions]);
  const handleClose = useCallback10(() => {
    window.dispatchEvent(new CustomEvent("e-onboarding-user-exit"));
    updateProgress2.mutate(
      { user_exit: true },
      {
        onSuccess: () => {
          actions.setExitType("user_exit");
          onClose?.();
        },
        onError: () => {
          actions.setError(t("error.failed_mark_exit"));
        }
      }
    );
  }, [actions, onClose, updateProgress2]);
  const handleBack = useCallback10(() => {
    if (isFirst) {
      actions.setGuest(false);
    } else {
      actions.prevStep();
    }
  }, [actions, isFirst]);
  const redirectToNewPage = useCallback10(() => {
    const redirectUrl = urls.createNewPage || urls.editor || urls.dashboard;
    window.location.href = redirectUrl;
  }, [urls]);
  const handleSkip = useCallback10(() => {
    if (isLast) {
      setIsCompleting(true);
      updateProgress2.mutate(
        {
          skip_step: true,
          complete: true,
          step_index: stepIndex,
          total_steps: totalSteps
        },
        {
          onSuccess: redirectToNewPage,
          onError: redirectToNewPage
        }
      );
      return;
    }
    updateProgress2.mutate(
      {
        skip_step: true,
        step_index: stepIndex,
        total_steps: totalSteps
      },
      {
        onSuccess: () => {
          actions.nextStep();
        },
        onError: () => {
          actions.nextStep();
        }
      }
    );
  }, [actions, isLast, stepIndex, totalSteps, updateProgress2, redirectToNewPage]);
  const handleContinue = useCallback10(
    (directChoice) => {
      if (directChoice) {
        updateChoices2.mutate(directChoice);
      } else {
        const storedChoice = choices[stepId];
        if (!isChoiceEmpty(storedChoice)) {
          updateChoices2.mutate({ [stepId]: storedChoice });
        }
      }
      if (isLast) {
        setIsCompleting(true);
        updateProgress2.mutate(
          {
            complete_step: stepId,
            complete: true,
            step_index: stepIndex,
            total_steps: totalSteps
          },
          {
            onSuccess: redirectToNewPage,
            onError: redirectToNewPage
          }
        );
        return;
      }
      updateProgress2.mutate(
        {
          complete_step: stepId,
          step_index: stepIndex,
          total_steps: totalSteps
        },
        {
          onSuccess: () => {
            actions.completeStep(stepId);
            actions.nextStep();
          },
          onError: () => {
            actions.setError(t("error.failed_complete_step"));
          }
        }
      );
    },
    [stepId, stepIndex, totalSteps, choices, actions, isLast, updateProgress2, updateChoices2, redirectToNewPage]
  );
  const rightPanelConfig = useMemo6(() => getStepVisualConfig(stepId), [stepId]);
  const isPending = updateProgress2.isPending || isLoading;
  const choiceForStep = choices[stepId];
  const continueDisabled = !isLast && isChoiceEmpty(choiceForStep);
  const getContinueLabel = () => {
    if (stepId === StepId.THEME_SELECTION && !completedSteps.includes(StepId.THEME_SELECTION)) {
      return t("steps.theme_selection.continue_with_theme");
    }
    if (stepId === StepId.SITE_FEATURES && !completedSteps.includes(StepId.SITE_FEATURES)) {
      return t("steps.site_features.continue_with_free");
    }
    if (isLast) {
      return t("common.finish");
    }
    return t("common.continue");
  };
  const renderStepContent = () => {
    switch (stepId) {
      case StepId.BUILDING_FOR:
        return /* @__PURE__ */ React31.createElement(BuildingFor, { onComplete: handleContinue });
      case StepId.SITE_ABOUT:
        return /* @__PURE__ */ React31.createElement(SiteAbout, null);
      case StepId.EXPERIENCE_LEVEL:
        return /* @__PURE__ */ React31.createElement(ExperienceLevel, { onComplete: handleContinue });
      case StepId.THEME_SELECTION:
        return /* @__PURE__ */ React31.createElement(ThemeSelection, { onComplete: handleContinue });
      case StepId.SITE_FEATURES:
        return /* @__PURE__ */ React31.createElement(SiteFeatures, null);
      default:
        return /* @__PURE__ */ React31.createElement(Box16, { sx: { flex: 1, width: "100%" } });
    }
  };
  if (isCompleting) {
    return /* @__PURE__ */ React31.createElement(CompletionScreen, null);
  }
  if (!hasPassedLogin) {
    return /* @__PURE__ */ React31.createElement(
      BaseLayout,
      {
        topBar: /* @__PURE__ */ React31.createElement(TopBar, null, /* @__PURE__ */ React31.createElement(TopBarContent, { showUpgrade: false, showClose: false }))
      },
      /* @__PURE__ */ React31.createElement(Login, { onConnect: handleConnect, onContinueAsGuest: handleContinueAsGuest })
    );
  }
  if (shouldShowProInstall) {
    return /* @__PURE__ */ React31.createElement(
      BaseLayout,
      {
        topBar: /* @__PURE__ */ React31.createElement(TopBar, null, /* @__PURE__ */ React31.createElement(TopBarContent, { showUpgrade: false, showClose: false }))
      },
      /* @__PURE__ */ React31.createElement(ProInstall, null)
    );
  }
  return /* @__PURE__ */ React31.createElement(
    BaseLayout,
    {
      testId: "onboarding-steps",
      topBar: /* @__PURE__ */ React31.createElement(TopBar, null, /* @__PURE__ */ React31.createElement(
        TopBarContent,
        {
          showClose: false,
          onClose: handleClose,
          onUpgrade: () => window.open(urls.upgradeUrl, "_blank")
        }
      )),
      footer: /* @__PURE__ */ React31.createElement(Footer, null, /* @__PURE__ */ React31.createElement(
        FooterActions,
        {
          showBack: true,
          showSkip: true,
          showContinue: true,
          continueLabel: getContinueLabel(),
          continueDisabled,
          continueLoading: isPending,
          onBack: handleBack,
          onSkip: handleSkip,
          onContinue: () => handleContinue()
        }
      ))
    },
    /* @__PURE__ */ React31.createElement(
      SplitLayout,
      {
        left: renderStepContent(),
        rightConfig: rightPanelConfig,
        progress: { currentStep: stepIndex, totalSteps }
      }
    )
  );
}

// src/components/app.tsx
function resolveColorScheme(preference) {
  if (preference === "dark") {
    return "dark";
  }
  if (preference === "light") {
    return "light";
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}
function App(props) {
  const store = useMemo7(() => {
    registerOnboardingSlice();
    let existingStore = __getStore();
    if (!existingStore) {
      existingStore = __createStore();
    }
    return existingStore;
  }, []);
  useEffect5(() => {
    store.dispatch(initFromConfig());
  }, [store]);
  const queryClient = useMemo7(() => createQueryClient(), []);
  const uiTheme = window.elementorAppConfig?.["e-onboarding"]?.uiTheme ?? "auto";
  const colorScheme = useMemo7(() => resolveColorScheme(uiTheme), [uiTheme]);
  return /* @__PURE__ */ React32.createElement(StoreProvider, { store }, /* @__PURE__ */ React32.createElement(QueryClientProvider, { client: queryClient }, /* @__PURE__ */ React32.createElement(DirectionProvider, { rtl: window.document.dir === "rtl" }, /* @__PURE__ */ React32.createElement(ThemeProvider, { colorScheme, palette: "argon-beta" }, /* @__PURE__ */ React32.createElement(AppContent, { ...props })))));
}
export {
  App
};
//# sourceMappingURL=index.mjs.map