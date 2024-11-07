// ChatDemo.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Page,
  Toolbar,
  BottomToolbar,
  Input,
  Button,
  ProgressCircular,
  Toast
} from 'react-onsenui';
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

const API_BASE_URL = 'http://127.0.0.1:8000/assistant';

const ChatDemo = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Fetch initial message on component mount
  useEffect(() => {
    const fetchInitialMessage = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.initial_message) {
            setMessages([{
              type: 'system',
              text: data.initial_message,
              timestamp: new Date().toISOString()
            }]);
          }
        }
      } catch (error) {
        console.error('Error fetching initial message:', error);
        showToast('エラーが発生しました。ページを更新してください。');
      }
    };
    fetchInitialMessage();
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      // Add user message to chat
      setMessages(prev => [...prev, {
        type: 'user',
        text: text,
        timestamp: new Date().toISOString()
      }]);

      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setMessages(prev => [...prev, {
          type: 'assistant',
          text: data.response,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error(data.message || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Error:', error);
      showToast('メッセージの送信中にエラーが発生しました');
    } finally {
      setLoading(false);
      setInputText('');
    }
  };

  const renderToolbar = () => (
    <Toolbar>
      <div className="center">リラコイ予約アシスタント</div>
    </Toolbar>
  );

  const renderBottomToolbar = () => (
    <BottomToolbar>
      <div style={{ display: 'flex', padding: '8px' }}>
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          modifier="underbar"
          placeholder="メッセージを入力"
          style={{ flex: 1, marginRight: '8px' }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(inputText);
            }
          }}
          disabled={loading}
        />
        <Button 
          onClick={() => sendMessage(inputText)}
          disabled={loading}
          modifier="material"
        >
          送信
        </Button>
      </div>
    </BottomToolbar>
  );

  const renderMessage = (message, index) => {
    const messageStyle = {
      marginBottom: '10px',
      textAlign: message.type === 'user' ? 'right' : 'left'
    };

    const textStyle = {
      background: message.type === 'user' ? '#007AFF' : 
                  message.type === 'system' ? '#f0f0f0' : '#E5E5EA',
      color: message.type === 'user' ? 'white' : 'black',
      padding: '8px 12px',
      borderRadius: '18px',
      display: 'inline-block',
      maxWidth: '70%',
      wordBreak: 'break-word',
      textAlign: message.type === 'system' ? 'center' : 'left',
      whiteSpace: 'pre-wrap'
    };

    return (
      <div key={index} style={messageStyle}>
        <span style={textStyle}>
          {message.text}
        </span>
      </div>
    );
  };

  return (
    <Page 
      renderToolbar={renderToolbar} 
      renderBottomToolbar={renderBottomToolbar}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 88px)'
      }}>
        <div 
          ref={chatContainerRef}
          style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#f9f9f9'
          }}
        >
          {messages.map((message, index) => renderMessage(message, index))}
          <div ref={messagesEndRef} />
        </div>

        {loading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999
          }}>
            <ProgressCircular indeterminate />
          </div>
        )}

        <Toast
          isOpen={toastVisible}
          animation="fade"
        >
          {toastMessage}
        </Toast>
      </div>
    </Page>
  );
};

export default ChatDemo;