import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DisclaimerBanner />
      {children}
    </>
  );
}
