import React from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';

export default function FormField({
    value,
    onChange,
    placeholder,
    iconClass = '',
    onSelectOnMap,
    isSelecting = false,
    title = ''
}) {
    return (
        <div className="route-input-group">
            <div className="input-with-icon">
                <i className={iconClass}></i>
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            </div>
            {onSelectOnMap && (
                <Button
                    variant="icon-select"
                    active={isSelecting}
                    onClick={onSelectOnMap}
                    title={title}
                >
                    <i className="fa-solid fa-location-crosshairs"></i>
                </Button>
            )}
        </div>
    );
}
