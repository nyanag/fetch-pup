import LoginForm from './login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchPage from './search';

const LoginPage: React.FC = () => {
  const apiUrl = 'https://frontend-take-home-service.fetch.com/auth/login'
  return (
    <Router>
      <Routes>
        <Route path="/" element = {<LoginForm apiUrl={apiUrl} />} />
        <Route path="/search" element = {<SearchPage />} />
      </Routes>
    </Router>
  );
};

export default LoginPage;
