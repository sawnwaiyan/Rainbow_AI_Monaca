import React from 'react';
import Button from './Button';

const PromptButton = ({ icon, label, onClick }) => (
	<Button
		icon={icon}
		label={label}
		onClick={onClick}
		modifier="prompt-button"
	/>
);

export default PromptButton;