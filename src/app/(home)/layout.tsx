import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}
