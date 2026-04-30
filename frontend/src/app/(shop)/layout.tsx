import { Navbar } from '@/components/ui/Navbar';
import { CartDrawer } from '@/components/ui/CartDrawer';
import { AnnouncementBar } from '@/components/ui/AnnouncementBar';
import { Footer } from '@/components/ui/Footer';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
