import React, { useState, useRef, useEffect } from 'react';
import { Page, Toolbar, BottomToolbar } from 'react-onsenui';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PromptButton from '../components/common/PromptButton';
import BookingConfirmationModal from '../components/chat/BookingConfirmationModal';
import { sendMessage } from '../services/api';
import '../styles/custom.css';

const defaultPrompts = [
	{ key: 'reservation', label: '予約', icon: 'fa-calendar' },
	{ key: 'reservationList', label: '予約リスト', icon: 'fa-list' },
	{ key: 'chat', label: 'チャット', icon: 'fa-comments' },
	{ key: 'profile', label: 'プロフィール', icon: 'fa-user' },
];

const promptConfigs = {
	'therapistSelection': { label: 'セラピスト選択', icon: 'fa-user-md' },
	'serviceSelection': { label: 'サービスメニュー選択', icon: 'fa-list-alt' },
	'dateSelection': { label: '日付選択', icon: 'fa-calendar' },
	'timeSelection': { label: '時間選択', icon: 'fa-clock' },
	'addressSelection': { label: '住所選択', icon: 'fa-map-marker-alt' },
	'creditCardSelection': { label: 'クレジットカード選択', icon: 'fa-credit-card' },
	'confirmation': { label: '予約確認', icon: 'fa-check-circle' }
};

export default function ChatPage() {
	const [inputText, setInputText] = useState('');
	const [currentPrompts, setCurrentPrompts] = useState(defaultPrompts);
	const [childPrompts, setChildPrompts] = useState([]);
	const [messages, setMessages] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [bookingStep, setBookingStep] = useState('');
	const inputRef = useRef(null);
	const chatRef = useRef(null);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const [bookingDetails, setBookingDetails] = useState({
		therapist: null,
		service: null,
		date: null,
		time: null,
		address: null,
		creditCard: null
	});

	useEffect(() => {
		if (chatRef.current) {
			chatRef.current.scrollTop = chatRef.current.scrollHeight;
		}
	}, [messages]);

	const addMessage = (message) => {
		setMessages(prevMessages => [...prevMessages, message]);
	};

	const handleError = (message) => {
		addMessage({ type: 'ai', text: message });
		setIsLoading(false);
	};

	const updatePromptStep = (step) => {
		setBookingStep(step);
		const config = promptConfigs[step];
		if (config) {
			setCurrentPrompts([{ key: step, ...config }]);
		}
	};

	const handleSelectionStep = async (messageType, selection, nextStep, contextData = {}) => {
		try {
			setIsLoading(true);
			setChildPrompts([]);
	
			// Store selection in localStorage and update booking details
			const selectionKey = messageType.split('_')[0];
			const capitalizedKey = selectionKey.charAt(0).toUpperCase() + selectionKey.slice(1);
			localStorage.setItem(`selected${capitalizedKey}`, JSON.stringify(selection));
			
			// Update booking details
			setBookingDetails(prev => ({
				...prev,
				[selectionKey]: selection
			}));
	
			// Add user message
			const selectionDisplay = selection.name || selection.date || selection.time || selection.address || selection.display;
			addMessage({ type: 'user', text: `${selectionDisplay}を選択しました` });
	
			// Send message to AI with context
			const aiResponse = await sendMessage(selectionDisplay, messageType, {
				...contextData,
				customer_id: localStorage.getItem('customerId')
			});
			
			// Handle AI response
			if (aiResponse.response) {
				addMessage({ type: 'ai', text: aiResponse.response });
			}
	
			// Update prompts
			updatePromptStep(nextStep);
	
			// Map response keys to their respective arrays
			const responseMap = {
				therapistSelection: aiResponse.therapists,
				serviceSelection: aiResponse.services,
				dateSelection: aiResponse.dates,
				timeSelection: aiResponse.times,
				addressSelection: aiResponse.addresses,
				creditCardSelection: aiResponse.credit_cards
			};
	
			const promptData = responseMap[nextStep] || [];
			
			if (promptData.length > 0) {
				setChildPrompts(promptData.map(item => ({
					key: `${nextStep}-${item.id}`,
					label: item.name || item.date || item.time || item.address || item.display,
					onClick: () => handleSelection(nextStep, item)
				})));
			} else if (nextStep !== 'confirmation') {
				handleError('選択可能なオプションが見つかりません。');
			}
		} catch (error) {
			console.error(`Error in ${messageType}:`, error);
			handleError('処理中にエラーが発生しました。もう一度お試しください。');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSelection = (step, selection) => {
		const steps = {
			'therapistSelection': () => handleSelectionStep('therapist_selection', selection, 'serviceSelection'),
			'serviceSelection': () => handleSelectionStep('service_selection', selection, 'dateSelection'),
			'dateSelection': () => {
				const selectedTherapist = JSON.parse(localStorage.getItem('selectedTherapist'));
				const selectedService = JSON.parse(localStorage.getItem('selectedService'));
				if (!selectedTherapist || !selectedService) {
					handleError('セラピストとサービスを先に選択してください。');
					return;
				}
				handleSelectionStep('date_selection', selection, 'timeSelection', {
					therapist_id: selectedTherapist.id,
					date: selection.date,
					service_time: selectedService.duration
				});
			},
			'timeSelection': () => handleSelectionStep('time_selection', selection, 'addressSelection', {
				customer_id: localStorage.getItem('customerId')
			}),
			'addressSelection': () => handleSelectionStep('address_selection', selection, 'creditCardSelection', {
				customer_id: localStorage.getItem('customerId')
			}),
			'creditCardSelection': () => handleSelectionStep('credit_card_selection', selection, 'confirmation')
		};
	
		if (steps[step]) {
			steps[step]();
		}
	};

	const handlePromptClick = async (key) => {
		if (key === 'reservation') {
			setIsLoading(true);
			try {
				const aiResponse = await sendMessage('start_booking', 'initial');
				addMessage({ type: 'ai', text: aiResponse.response });

				if (aiResponse.therapists) {
					updatePromptStep('therapistSelection');
					setChildPrompts(aiResponse.therapists.map(therapist => ({
						key: `therapist-${therapist.id}`,
						label: therapist.name,
						imageUrl: therapist.imageUrl,
						onClick: () => handleSelection('therapistSelection', therapist)
					})));
				} else {
					handleError('セラピストの情報を取得できませんでした。');
				}
			} catch (error) {
				handleError('エラーが発生しました。もう一度お試しください。');
			} finally {
				setIsLoading(false);
			}
		} else if (key === 'confirmation') {
			setIsConfirmationModalOpen(true);
		}
	};

	const handleSend = async () => {
		if (inputText.trim()) {
			addMessage({ type: 'user', text: inputText });
			setInputText('');
			const aiResponse = await sendMessage(inputText, 'chat');
			addMessage({ type: 'ai', text: aiResponse.response || 'すみません、応答を生成できませんでした。' });
		}
	};

	const getIconForPromptType = (promptKey) => {
		if (promptKey.includes('therapist')) return 'fa-user-md';
		if (promptKey.includes('service')) return 'fa-list-alt';
		if (promptKey.includes('date')) return 'fa-calendar';
		if (promptKey.includes('time')) return 'fa-clock';
		if (promptKey.includes('address')) return 'fa-map-marker-alt';
		if (promptKey.includes('creditCard')) return 'fa-credit-card';
		return 'fa-chevron-right'; // Default icon
	};

	// Render functions remain the same
	const renderToolbar = () => (
		<Toolbar>
			<div className="center">りらこい　AI チャット</div>
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
					ref={inputRef}
				/>
				<Button
					label="送信"
					onClick={handleSend}
					primary={true}
				/>
			</div>
		</BottomToolbar>
	);

	return (
		<Page renderToolbar={renderToolbar} renderBottomToolbar={renderBottomToolbar} className="custom-page" id="main_chat">
			<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} >
				{/* Prompts Section */}
				<div style={{ 
					padding: '12px',
					borderBottom: '1px solid #e0e0e0',
					backgroundColor: '#F5F5F5',
					maxHeight: '22vh',
					overflowY: 'auto',
					WebkitOverflowScrolling: 'touch'
				}}>
					{(currentPrompts.length > 4 || childPrompts.length > 4) && (
						<div className="scroll-indicator txt-white mb-10">
							下にスクロールして続きを表示
						</div>
					)}

					{/* Main Prompts */}
					{currentPrompts.length > 0 && (
						<div style={{ 
							display: 'grid',
							gridTemplateColumns: 'repeat(2, 1fr)',
							gap: '12px',
							marginBottom: childPrompts.length > 0 ? '12px' : '0'
						}}>
							{currentPrompts.map((prompt) => (
								<PromptButton
									key={prompt.key}
									icon={prompt.icon}
									label={prompt.label}
									onClick={() => handlePromptClick(prompt.key)}
								/>
							))}
						</div>
					)}

					{/* Child Prompts */}
					{childPrompts.length > 0 && (
						<div style={{ 
							display: 'grid',
							gridTemplateColumns: 'repeat(2, 1fr)',
							gap: '12px'
						}}>
							{isLoading ? (
								<div style={{ 
									gridColumn: 'span 2',
									textAlign: 'center',
									padding: '12px'
								}}>
									<p>Loading...</p>
								</div>
							) : (
								childPrompts.map((prompt) => (
									<PromptButton
										key={prompt.key}
										label={prompt.label}
										onClick={prompt.onClick}
										icon={getIconForPromptType(prompt.key)}
										imageUrl={prompt.imageUrl}
									/>
								))
							)}
						</div>
					)}
				</div>

				{/* Chat Messages */}
				<div 
					ref={chatRef}
					style={{ 
						flex: 1,
						overflowY: 'auto',
						padding: '16px',
						backgroundColor: '#fff',
						minHeight: '30vh'
					}}
				>
					{messages.map((message, index) => (
						<div key={index} style={{
							marginBottom: '10px',
							textAlign: message.type === 'user' ? 'right' : 'left'
						}}>
							<span style={{
								background: message.type === 'user' ? '#007AFF' : '#E5E5EA',
								color: message.type === 'user' ? 'white' : 'black',
								padding: '8px 12px',
								borderRadius: '18px',
								display: 'inline-block',
								maxWidth: '70%',
								wordBreak: 'break-word'
							}}>
								{message.text}
							</span>
						</div>
					))}
				</div>
			</div>

			<BookingConfirmationModal
				isOpen={isConfirmationModalOpen}
				onClose={() => setIsConfirmationModalOpen(false)}
				bookingDetails={bookingDetails}
			/>
		</Page>
	);
}