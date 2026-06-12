import { SettingsForm } from "./settings-form"
import { getSiteSettings } from "@/lib/data.server"

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div className="space-y-6">
      <SettingsForm initialSettings={settings} />
    </div>
  )
}
