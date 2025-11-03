import UnRegNavbar from '../components/UnRegNavbar';

const PendingLayout = ({ children }) => {
  return (
    <>
      <UnRegNavbar />
      <main>{children}</main>
    </>
  );
};

export default PendingLayout;