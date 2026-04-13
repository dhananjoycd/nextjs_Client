"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Protected } from "@/components/Protected";
import { DashboardShell } from "@/components/dashboard/shell";
import { Button, Card, Input, Switch, Textarea } from "@/components/ui";
import { ADMIN_NAV_LINKS } from "@/app/dashboard/admin/_shared";

type AdminSettings = {
  platformName: string;
  supportEmail: string;
  defaultDeliveryFee: string;
  maxMealsPerProvider: string;
  maintenanceMode: boolean;
  allowNewProviderSignup: boolean;
  homeAnnouncement: string;
};

const STORAGE_KEY = "foodhub_admin_settings";

const DEFAULT_SETTINGS: AdminSettings = {
  platformName: "FoodHub",
  supportEmail: "support@foodhub.local",
  defaultDeliveryFee: "2.50",
  maxMealsPerProvider: "100",
  maintenanceMode: false,
  allowNewProviderSignup: true,
  homeAnnouncement: "",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<AdminSettings>;
      setSettings({ ...DEFAULT_SETTINGS, ...parsed });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  function updateField<K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function saveSettings() {
    try {
      setSaving(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected roles={["ADMIN"]}>
      <DashboardShell title="Settings" description="Configure admin-level platform controls." links={ADMIN_NAV_LINKS}>
        <Card className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Platform Name</label>
              <Input value={settings.platformName} onChange={(e) => updateField("platformName", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Support Email</label>
              <Input value={settings.supportEmail} onChange={(e) => updateField("supportEmail", e.target.value)} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Default Delivery Fee</label>
              <Input
                type="number"
                step="0.01"
                value={settings.defaultDeliveryFee}
                onChange={(e) => updateField("defaultDeliveryFee", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Max Meals Per Provider</label>
              <Input
                type="number"
                value={settings.maxMealsPerProvider}
                onChange={(e) => updateField("maxMealsPerProvider", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-xs text-slate-600">Temporarily put the platform into maintenance mode.</p>
              </div>
              <Switch checked={settings.maintenanceMode} onCheckedChange={(value) => updateField("maintenanceMode", value)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="font-medium">Allow New Provider Signup</p>
                <p className="text-xs text-slate-600">Enable or disable provider registration.</p>
              </div>
              <Switch
                checked={settings.allowNewProviderSignup}
                onCheckedChange={(value) => updateField("allowNewProviderSignup", value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Homepage Announcement</label>
            <Textarea
              value={settings.homeAnnouncement}
              onChange={(e) => updateField("homeAnnouncement", e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
          </div>
        </Card>
      </DashboardShell>
    </Protected>
  );
}
