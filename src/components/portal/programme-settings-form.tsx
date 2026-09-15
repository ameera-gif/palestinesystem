import { getProgrammeSettings, quarterlyAmount, type ProgrammeSettings } from "@/lib/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { updateSettingsAction } from "@/app/admin/settings/actions";

// Shared by both /admin/settings and /management/settings — the underlying
// action already accepts MYFUNDACTION_PC and ADMIN, since PC runs the
// programme day to day and shouldn't need to wait on the rarely-active
// Admin role to adjust the sponsorship amount or a cycle length.
export async function ProgrammeSettingsForm() {
  const settings: ProgrammeSettings = await getProgrammeSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink mb-1">Programme Settings</h1>
      <p className="text-sm text-muted mb-6">
        These values drive every sponsorship amount, distribution cycle, reporting cycle, and meeting cadence in the
        system — nothing is hard-coded. Current quarterly support: {formatMoney(quarterlyAmount(settings), settings.currency)}.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Sponsorship &amp; distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateSettingsAction} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Monthly sponsorship amount" required>
                <Input type="number" name="monthlySponsorshipAmount" defaultValue={settings.monthlySponsorshipAmount} min={1} required />
              </Field>
              <Field label="Currency" required>
                <Input name="currency" defaultValue={settings.currency} required />
              </Field>
              <Field label="Distribution frequency (months)" required>
                <Input type="number" name="distributionFrequencyMonths" defaultValue={settings.distributionFrequencyMonths} min={1} required />
              </Field>
              <Field label="Reporting cycle (months)" required>
                <Input type="number" name="reportingCycleMonths" defaultValue={settings.reportingCycleMonths} min={1} required />
              </Field>
              <Field label="Meeting cycle (months)" required>
                <Input type="number" name="meetingCycleMonths" defaultValue={settings.meetingCycleMonths} min={1} required />
              </Field>
            </div>
            <Button type="submit">Save Settings</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
