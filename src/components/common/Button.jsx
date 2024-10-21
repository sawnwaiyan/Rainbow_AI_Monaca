import React, { forwardRef } from 'react';
import { Button as OnsenButton, Icon } from 'react-onsenui';
import '../../styles/custom.css';

const Button = forwardRef(({ icon, label, onClick, modifier = '', primary = false }, ref) => {
	const buttonClass = `custom-button ${primary ? 'custom-button--primary' : ''}`;
	
	return (
		<OnsenButton 
			onClick={onClick} 
			modifier={`${modifier} ${buttonClass}`}
			ref={ref}
		>
			{icon && <Icon icon={icon} className="custom-button__icon" />}
			<span className="custom-button__label">{label}</span>
		</OnsenButton>
	);
});

export default Button;