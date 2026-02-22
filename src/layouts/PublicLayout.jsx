import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useGlobalContext } from '../Context';

const PublicLayout = ({ children }) => {
  const { isAuthenticated } = useGlobalContext()
  return (
    <>
      <Navbar />
      {isAuthenticated && <Sidebar publicPage={true} />}
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default PublicLayout;