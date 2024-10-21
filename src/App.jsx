import React from 'react';
import { Route, Switch } from 'wouter';
import { Page } from 'react-onsenui';
import ChatPage from './pages/ChatPage';

export default function App() {
  return (
    <Page>
      <Switch>
        <Route path="/" component={ChatPage} />
        {/* Add more routes here as needed */}
      </Switch>
    </Page>
  );
}