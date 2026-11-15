import { createFileRoute } from "@tanstack/react-router";
import { CampaignBuilder } from "@/components/campaign-builder";
import { PageIntro } from "@/components/agency";
import { seo } from "@/content/site";

export const Route = createFileRoute("/campaign-brief")({
  head: () => seo("AI Campaign Brief", "Create a tailored NEXTDOOR ADS campaign brief for your business, audience, advertising goals and budget."),
  component: CampaignPage,
});
function CampaignPage() {
  return <>
    <PageIntro label="AI-assisted. Human-led." title="Your Campaign Brief." copy="Your business. Your ambitions. A creative starting point shaped around both." />
    <CampaignBuilder />
  </>;
}