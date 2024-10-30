import React from 'react';
import Button from './Button';

const PromptButton = ({ icon, label, onClick, imageUrl, subtitle }) => (
	<Button
		icon={icon}
		label={
			<div className="prompt-label-container">
				<div className="prompt-main-label">{label}</div>
				{subtitle && <div className="prompt-subtitle">{subtitle}</div>}
			</div>
		}
		onClick={onClick}
		modifier="prompt-button"
		imageUrl={imageUrl}
	/>
);

export default PromptButton;