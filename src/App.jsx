import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SurveyForm from './pages/SurveyForm';
import DefectSurvey from './pages/DefectSurvey';
import DefectVerification from './pages/DefectVerification';
import Settings from './pages/Settings';
import SurveyResults from './pages/SurveyResults';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/survey" element={<SurveyForm />} />
          <Route path="/defect-survey" element={<DefectSurvey />} />
          <Route path="/defect-verification" element={<DefectVerification />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/results" element={<SurveyResults />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
