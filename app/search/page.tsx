import { CustomerShell } from "@/components/customer/CustomerShell";
import { CustomerSearchForm } from "@/components/customer/CustomerSearchForm";

export default function SearchPage() {
  return (
    <CustomerShell>
      <section className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
        <CustomerSearchForm />
      </section>
    </CustomerShell>
  );
}
