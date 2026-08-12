"use client";

import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Database,
  Shield,
  RefreshCw,
  Save,
  Check,
  Loader2,
  ChevronDown,
  Mail,
  BellRing,
  Clock,
  Activity,
  KeyRound,
  RotateCcw,
  CircleDot,
} from "lucide-react";

type SaveState = "idle" | "saving" | "saved";

interface MonitoringSettings {
  autoRefresh: boolean;
  refreshInterval: string;
  notifications: boolean;
  emailAlerts: boolean;
}

const STORAGE_KEY = "monitoring-settings";

const DEFAULT_SETTINGS: MonitoringSettings = {
  autoRefresh: true,
  refreshInterval: "5",
  notifications: true,
  emailAlerts: false,
};

function loadStoredSettings(): MonitoringSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw);

    // Guard against a malformed/partial payload from an older version.
    return {
      autoRefresh:
        typeof parsed.autoRefresh === "boolean"
          ? parsed.autoRefresh
          : DEFAULT_SETTINGS.autoRefresh,
      refreshInterval:
        typeof parsed.refreshInterval === "string"
          ? parsed.refreshInterval
          : DEFAULT_SETTINGS.refreshInterval,
      notifications:
        typeof parsed.notifications === "boolean"
          ? parsed.notifications
          : DEFAULT_SETTINGS.notifications,
      emailAlerts:
        typeof parsed.emailAlerts === "boolean"
          ? parsed.emailAlerts
          : DEFAULT_SETTINGS.emailAlerts,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function settingsEqual(a: MonitoringSettings, b: MonitoringSettings) {
  return (
    a.autoRefresh === b.autoRefresh &&
    a.refreshInterval === b.refreshInterval &&
    a.notifications === b.notifications &&
    a.emailAlerts === b.emailAlerts
  );
}

export default function SettingsPage() {
  // `settings` is the live UI state; `savedSettings` is the last persisted
  // snapshot (what's actually in localStorage). Comparing the two is how we
  // know whether there are unsaved changes.
  const [settings, setSettings] = useState<MonitoringSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] =
    useState<MonitoringSettings>(DEFAULT_SETTINGS);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [hydrated, setHydrated] = useState(false);

  // Load whatever was previously saved once the component mounts on the
  // client (localStorage isn't available during SSR).
  useEffect(() => {
    const stored = loadStoredSettings();
    setSettings(stored);
    setSavedSettings(stored);
    setHydrated(true);
  }, []);

  const isDirty = hydrated && !settingsEqual(settings, savedSettings);

  const updateSetting = <K extends keyof MonitoringSettings>(
    key: K,
    value: MonitoringSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (saveState === "saving") return;

    setSaveState("saving");

    window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSavedSettings(settings);
      setSaveState("saved");

      window.setTimeout(() => {
        setSaveState("idle");
      }, 2000);
    }, 500);
  };

  const handleReset = () => {
    // UI-only: does not touch localStorage or savedSettings. The user still
    // has to press Save Settings for this to persist.
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/20">
              <SettingsIcon size={22} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Settings
              </h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base max-w-md">
                Configure how AI DB Monitor refreshes data, alerts you, and
                keeps your account secure.
              </p>
            </div>
          </div>

          <ConfigurationStatus settings={settings} isDirty={isDirty} />
        </div>

        {/* 2-column layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <SectionCard
            icon={<RefreshCw size={18} className="text-cyan-400" />}
            iconBg="bg-cyan-500/10 ring-cyan-500/20"
            title="Monitoring"
            description="Configure monitoring refresh behavior."
          >
            <SettingRow
              icon={<Activity size={16} />}
              label="Automatic Refresh"
              description="Automatically refresh monitoring data in the background."
              status={settings.autoRefresh ? "Enabled" : "Disabled"}
            >
              <ToggleSwitch
                checked={settings.autoRefresh}
                onChange={() =>
                  updateSetting("autoRefresh", !settings.autoRefresh)
                }
                label="Automatic refresh"
              />
            </SettingRow>

            <SettingRow
              icon={<Clock size={16} />}
              label="Refresh Interval"
              description={
                settings.autoRefresh
                  ? "How often monitoring data should refresh."
                  : "Enable automatic refresh to set an interval."
              }
              last
            >
              <IntervalSelect
                value={settings.refreshInterval}
                onChange={(v) => updateSetting("refreshInterval", v)}
                disabled={!settings.autoRefresh}
              />
            </SettingRow>
          </SectionCard>

          <SectionCard
            icon={<Bell size={18} className="text-yellow-400" />}
            iconBg="bg-yellow-500/10 ring-yellow-500/20"
            title="Notifications"
            description="Manage monitoring notifications."
          >
            <SettingRow
              icon={<BellRing size={16} />}
              label="Database Alerts"
              description="Show alerts when database issues are detected."
              status={settings.notifications ? "Enabled" : "Disabled"}
            >
              <ToggleSwitch
                checked={settings.notifications}
                onChange={() =>
                  updateSetting("notifications", !settings.notifications)
                }
                label="Database alerts"
              />
            </SettingRow>

            <SettingRow
              icon={<Mail size={16} />}
              label="Email Notifications"
              description="Receive monitoring alerts through email."
              status={settings.emailAlerts ? "Enabled" : "Disabled"}
              last
            >
              <ToggleSwitch
                checked={settings.emailAlerts}
                onChange={() =>
                  updateSetting("emailAlerts", !settings.emailAlerts)
                }
                label="Email notifications"
              />
            </SettingRow>
          </SectionCard>

          <SectionCard
            icon={<Database size={18} className="text-green-400" />}
            iconBg="bg-green-500/10 ring-green-500/20"
            title="Database Monitoring"
            description="Monitoring platform information."
          >
            <div className="divide-y divide-slate-800/80">
              <InfoRow label="Monitoring Platform" value="AI DB Monitor" />
              <InfoRow label="Monitoring Type" value="PostgreSQL" />
              <InfoRow label="Monitoring Mode" value="Real-time" />
              <InfoRow label="Version" value="1.0" />
            </div>
          </SectionCard>

          <SectionCard
            icon={<Shield size={18} className="text-purple-400" />}
            iconBg="bg-purple-500/10 ring-purple-500/20"
            title="Security"
            description="Account and authentication information."
          >
            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3.5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-slate-500">
                  <KeyRound size={16} />
                </span>
                <div>
                  <p className="font-medium text-sm sm:text-[15px]">
                    Authentication
                  </p>
                  <p className="text-sm text-green-400 mt-1 flex items-center gap-1.5">
                    <CircleDot size={12} className="text-green-400" />
                    JWT authentication enabled
                  </p>
                </div>
              </div>

              <span className="shrink-0 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium ring-1 ring-inset ring-green-500/20">
                Active
              </span>
            </div>
          </SectionCard>
        </div>

        {/* Save bar */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-6">
          <SaveStatusText isDirty={isDirty} saveState={saveState} />

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              disabled={saveState === "saving"}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800/60 hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={15} />
              Reset to Defaults
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saveState === "saving"}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] transition-all duration-150 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saveState === "saving" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving…
                </>
              ) : saveState === "saved" ? (
                <>
                  <Check size={18} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Shared building blocks ----------

function SectionCard({
  icon,
  iconBg,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm shadow-black/20 transition-colors hover:border-slate-700/80 h-full">
      <div className="flex items-center gap-3 mb-5 sm:mb-6">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${iconBg}`}
        >
          {icon}
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>

      <div>{children}</div>
    </section>
  );
}

function SettingRow({
  icon,
  label,
  description,
  status,
  children,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  status?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between ${
        last ? "" : "border-b border-slate-800/80"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-slate-500">{icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm sm:text-[15px]">{label}</p>
            {status && (
              <span
                className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ring-1 ring-inset ${
                  status === "Enabled"
                    ? "text-cyan-400 bg-cyan-500/10 ring-cyan-500/20"
                    : "text-slate-400 bg-slate-800 ring-slate-700"
                }`}
              >
                {status}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
      </div>

      <div className="pl-7 sm:pl-0">{children}</div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
        checked ? "bg-cyan-500" : "bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ease-out ${
          checked ? "left-7" : "left-1"
        }`}
      />
    </button>
  );
}

const INTERVAL_OPTIONS = [
  { value: "1", label: "1 minute" },
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "15", label: "15 minutes" },
];

function IntervalSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Refresh interval"
        className="appearance-none bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-9 py-2 text-sm text-white outline-none transition-colors hover:border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-50 disabled:hover:border-slate-700 disabled:cursor-not-allowed"
      >
        {INTERVAL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-slate-400 text-sm sm:text-[15px]">{label}</span>
      <span className="text-white font-medium text-sm sm:text-[15px]">
        {value}
      </span>
    </div>
  );
}

function ConfigurationStatus({
  settings,
  isDirty,
}: {
  settings: MonitoringSettings;
  isDirty: boolean;
}) {
  const activeCount = [
    settings.autoRefresh,
    settings.notifications,
    settings.emailAlerts,
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm lg:min-w-[240px]">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${
          isDirty
            ? "bg-amber-500/10 ring-amber-500/20"
            : "bg-cyan-500/10 ring-cyan-500/20"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isDirty ? "bg-amber-400" : "bg-cyan-400"
          }`}
        />
      </div>
      <div>
        <p className="font-medium text-slate-200">Configuration Status</p>
        <p className="text-slate-400 mt-0.5">
          {activeCount}/3 features enabled
          {settings.autoRefresh
            ? ` · every ${settings.refreshInterval} min`
            : ""}
        </p>
      </div>
    </div>
  );
}

function SaveStatusText({
  isDirty,
  saveState,
}: {
  isDirty: boolean;
  saveState: SaveState;
}) {
  if (saveState === "saving") {
    return (
      <p className="text-sm text-slate-400 flex items-center gap-2">
        <Loader2 size={14} className="animate-spin" />
        Saving your settings…
      </p>
    );
  }

  if (isDirty) {
    return (
      <p className="text-sm text-amber-400 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Unsaved changes
      </p>
    );
  }

  return (
    <p className="text-sm text-slate-400 flex items-center gap-2">
      <Check size={14} className="text-green-400" />
      All changes saved
    </p>
  );
}