const Label = ({value, className}) => {
    return (
        <label className={`block text-sm font-medium text-gray-700 mb-2 
        ${className}`}>
            {value}
        </label>
    );
};

export default Label;
