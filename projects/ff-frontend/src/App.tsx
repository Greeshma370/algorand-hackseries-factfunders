import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DonatePage from './pages/DonatePage';
import ContactPage from './pages/ContactPage';
import CreateFundraiserPage from './pages/CreateFundraiserPage';
import FundraiserPage from './pages/FundraiserPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/create" element={<CreateFundraiserPage />} />
          <Route path="/fundraiser/:id" element={<FundraiserPage />} />
        </Routes>
      </Layout>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;
