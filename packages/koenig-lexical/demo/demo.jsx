import './styles/demo.css';
import DemoApp from './DemoApp';
import HtmlOutputDemo from './HtmlOutputDemo';
import Navigator from './components/Navigator';
import React from 'react';
import ReactDOM from 'react-dom/client';
import RestrictedContentDemo from './RestrictedContentDemo';
import {DesignSandbox} from '../src';
import {
    Route,
    HashRouter as Router,
    Routes
} from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <Navigator />
            <Routes>
                <Route element={<DesignSandbox />} path="/designsandbox" />
                <Route element={<RestrictedContentDemo paragraphs={1} />} path="/contentrestricted" />
                <Route element={<HtmlOutputDemo />} path="/html-output" />
                <Route element={<DemoApp introContent={true} />} path="/" />
            </Routes>
        </Router>
    </React.StrictMode>
);
