"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import {
  getNotificationPermission,
  requestNotificationPermission,
} from "@/services/notificationService";

export default function NotificationPermission() {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  async function handleEnableNotifications() {
    try {
      setLoading(true);

      const result =
        await requestNotificationPermission();

      setPermission(result);
    } catch (error) {
      console.error(
        "Notification permission error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  if (permission === "unsupported") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
        <BellOff className="h-5 w-5 text-yellow-400" />

        <div>
          <p className="text-sm font-medium text-yellow-300">
            Browser Notifications Not Supported
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Your current browser does not support
            notifications.
          </p>
        </div>
      </div>
    );
  }

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
        <CheckCircle className="h-5 w-5 text-green-400" />

        <div>
          <p className="text-sm font-medium text-green-300">
            Browser Notifications Enabled
          </p>

          <p className="mt-1 text-xs text-gray-500">
            You will receive browser alerts for new
            database issues.
          </p>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <BellOff className="h-5 w-5 text-red-400" />

        <div>
          <p className="text-sm font-medium text-red-300">
            Browser Notifications Blocked
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Allow notifications from your browser site
            settings to enable alerts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 text-cyan-400" />

        <div>
          <p className="text-sm font-medium text-white">
            Browser Notifications
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Get notified when the monitoring system
            detects a new database alert.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleEnableNotifications}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Enabling...
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" />
            Enable Notifications
          </>
        )}
      </button>
    </div>
  );
}