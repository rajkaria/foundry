import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { ForgeWizard } from "@/components/app/ForgeWizard";

export const metadata = {
  title: "Create a Forge — AI-assisted",
  description:
    "Describe the model you want trained. Foundry drafts the spec, suggests a dataset profile, and pre-fills the contribution window.",
};

export default function NewForgePage() {
  return (
    <main>
      <Header />
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <p className="text-caption text-ember-400">Create a Forge</p>
          <h1 className="text-display-xl mt-3 max-w-[26ch] text-platinum-100">
            Describe what you want trained.
          </h1>
          <p className="text-body-lg mt-6 max-w-[60ch] text-platinum-300">
            Foundry drafts the model spec, suggests dataset shape and size,
            picks the right eval metric, and pre-fills the contribution
            window. Edit anything before you confirm.
          </p>

          <div className="mt-12">
            <ForgeWizard />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
