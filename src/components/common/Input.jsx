import React, { forwardRef } from 'react';
import { Input as OnsenInput } from 'react-onsenui';

const Input = forwardRef((props, ref) => {
	return <OnsenInput {...props} ref={ref} />;
});

export default Input;