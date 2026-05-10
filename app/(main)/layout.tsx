import SiteHeader from "@/components/SiteHeader";

export default function MainLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      {modal}
    </>
  );
}
