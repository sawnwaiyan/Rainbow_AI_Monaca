// src/components/common/PromptButton.jsx
import React from 'react';
import Button from './Button';

const PromptButton = ({ icon, label, onClick, imageUrl }) => (
	<Button
		icon={icon}
		label={label}
		onClick={onClick}
		modifier="prompt-button"
		imageUrl={imageUrl}
	/>
);

export default PromptButton;