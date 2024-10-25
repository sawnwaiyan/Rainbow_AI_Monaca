// src/hooks/useChat.js
import { useState, useEffect, useCallback } from 'react';
import aiChatService from '../services/aiChatService';

// Changed to default export
export default function useChat() {
	const [messages, setMessages] = useState([]);
	const [prompts, setPrompts] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	// Fetch initial prompts
	useEffect(() => {
		const fetchPrompts = async () => {
			try {
				setIsLoading(true);
				const initialPrompts = await aiChatService.getInitialPrompts();
				setPrompts(initialPrompts);
			} catch (err) {
				setError('Failed to load initial prompts');
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPrompts();
	}, []);

	// Send message handler
	const sendMessage = useCallback(async (message) => {
		try {
			setIsLoading(true);
			setError(null);

			// Add user message to chat
			setMessages(prev => [...prev, {
				text: message,
				sender: 'user'
			}]);

			// Get AI response
			const response = await aiChatService.sendMessage(message);

			// Add AI response to chat
			setMessages(prev => [...prev, {
				text: response.message,
				sender: 'ai'
			}]);

			// Update prompts if provided in response
			if (response.prompts) {
				setPrompts(response.prompts);
			}
		} catch (err) {
			setError('Failed to send message');
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		messages,
		prompts,
		isLoading,
		error,
		sendMessage,
		clearError
	};
}