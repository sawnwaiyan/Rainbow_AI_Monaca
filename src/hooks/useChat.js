import { useState, useEffect, useCallback } from 'react';
import aiChatService from '../services/aiChatService';

export const useChat = () => {
	const [messages, setMessages] = useState([]);
	const [prompts, setPrompts] = useState([]);
	const [currentState, setCurrentState] = useState('initial');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchInitialPrompts();
	}, []);

	const fetchInitialPrompts = async () => {
		try {
			setIsLoading(true);
			const initialPrompts = await aiChatService.getInitialPrompts();
			setPrompts(initialPrompts);
		} catch (error) {
			setError('Failed to load initial prompts');
		} finally {
			setIsLoading(false);
		}
	};

	const sendMessage = useCallback(async (text) => {
		try {
			setIsLoading(true);
			
			// Add user message immediately
			const userMessage = {
				text,
				sender: 'user',
				timestamp: new Date()
			};
			setMessages(prev => [...prev, userMessage]);

			// Send to API and get response
			const response = await aiChatService.sendMessage(text, currentState);
			
			// Add AI response
			const aiMessage = {
				text: response.message,
				sender: 'ai',
				timestamp: new Date()
			};
			setMessages(prev => [...prev, aiMessage]);
			
			// Update state and prompts
			setCurrentState(response.currentState);
			if (response.prompts) {
				setPrompts(response.prompts);
			}
		} catch (error) {
			setError('Failed to send message');
			console.error('Error sending message:', error);
		} finally {
			setIsLoading(false);
		}
	}, [currentState]);

	const clearError = () => setError(null);

	return {
		messages,
		prompts,
		currentState,
		isLoading,
		error,
		sendMessage,
		clearError
	};
};