import Sidebar from '../components/Sidebar';

const PrivateLayout = ({ children }) => {
  return (
    <div className="webClient">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default PrivateLayout;