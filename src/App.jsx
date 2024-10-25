import React from 'react';
import { Route, Switch } from 'wouter';
import { Page } from 'react-onsenui';
import ChatPage from './pages/ChatPage';
import AiChatPage from './pages/AiChatPage';

export default function App() {
  return (
    <Page>
      <Switch>
        <Route path="/" component={AiChatPage} />
        {/* Add more routes here as needed */}
      </Switch>
    </Page>
  );
}