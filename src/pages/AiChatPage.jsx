import React, { useState } from 'react';
import {
	Page,
	List,
	ListItem,
	Input,
	Button,
	Icon,
	ProgressCircular
} from 'react-onsenui';
import { useChat } from '../hooks/useChat';
import '../styles/aiChat.css';
import sendIcon from '../pages/send-icon.png';

const SendIcon = ({ isLoading }) => {
	if (isLoading) {
		return <ProgressCircular indeterminate />;
	}

	return (
		<img 
			src={sendIcon}
			alt="Send message"
			className="ai-chat-send-icon"
			onError={(e) => {
				e.target.onerror = null;
				e.target.style.display = 'none';
				const fallbackIcon = document.createElement('i');
				fallbackIcon.className = 'icon-md-send';
				e.target.parentNode.appendChild(fallbackIcon);
			}}
		/>
	);
};

const ChatMessage = ({ message }) => (
	<ListItem
		className={`ai-chat-message ${message.sender}`}
		modifier="nodivider"
	>
		<div className="message-content">
			{message.text}
		</div>
	</ListItem>
);

const PromptButton = ({ prompt, onClick }) => (
	<Button
		onClick={() => onClick(prompt)}
		modifier="outline"
		className="ai-chat-prompt-button"
	>
		{prompt}
	</Button>
);

const AIChatPage = () => {
	const [input, setInput] = useState('');
	const {
		messages,
		prompts,
		isLoading,
		error,
		sendMessage,
		clearError
	} = useChat();

	const handleSend = () => {
		if (input.trim()) {
			sendMessage(input);
			setInput('');
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleSend();
		}
	};

	return (
		<Page>
			<div className="ai-chat-container">
				{error && (
					<div className="ai-chat-error" onClick={clearError}>
						{error}
					</div>
				)}

				<List
					className="ai-chat-messages"
					modifier="noborder"
				>
					{messages.map((message, index) => (
						<ChatMessage key={index} message={message} />
					))}
				</List>

				{messages.length === 0 && (
					<div className="ai-chat-prompt-grid">
						{prompts.map((prompt, index) => (
							<PromptButton
								key={index}
								prompt={prompt}
								onClick={sendMessage}
							/>
						))}
					</div>
				)}

				<div className="ai-chat-input-container">
					<Button modifier="quiet">
						<Icon icon="md-plus" />
					</Button>
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="メッセージを入力..."
						modifier="material"
						className="ai-chat-input"
						disabled={isLoading}
					/>
					<Button
						modifier="quiet"
						onClick={handleSend}
						disabled={isLoading}
						className="ai-chat-send-button"
					>
						<SendIcon isLoading={isLoading} />
					</Button>
				</div>
			</div>
		</Page>
	);
};

export default AIChatPage;