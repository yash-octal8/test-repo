import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, Check, Lock } from 'lucide-react';

const CustomListbox = ({
    value,
    onChange,
    options = [],
    disabled = false,
    className = "",
    disabledLabel = "Premium Required",
    disabledIcon = Lock,
    placeholder = "Select an option"
}) => {
    const selectedOption = options.find(opt => opt.value === value);

    return (
        <Listbox value={value} onChange={onChange} disabled={disabled}>
            <div className={`relative ${className}`}>
                <Listbox.Button className={`
                    relative w-full cursor-pointer rounded-xl py-3 pl-4 pr-10 text-left focus:outline-none focus:ring-0
                    ${!disabled
                        ? 'bg-white/5 border border-white/10 hover:border-indigo-500/50 text-white shadow-lg'
                        : 'bg-white/[0.02] border border-white/5 text-gray-500 cursor-not-allowed'
                    }
                    transition-all duration-300
                `}>
                    <span className="flex items-center gap-3">
                        {disabled ? (
                            <>
                                {disabledIcon && React.createElement(disabledIcon, { className: "w-5 h-5" })}
                                <span className="font-medium">{disabledLabel}</span>
                            </>
                        ) : (
                            <>
                                {selectedOption?.icon && (
                                    React.createElement(selectedOption.icon, {
                                        className: `w-5 h-5 ${selectedOption.color ? selectedOption.color.split(' ')[0] : ''}`
                                    })
                                )}
                                <span className="font-medium">{selectedOption?.label || placeholder}</span>
                            </>
                        )}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronDown className={`w-5 h-5 ${!disabled ? 'text-gray-400' : 'text-gray-600'}`} />
                    </span>
                </Listbox.Button>

                {!disabled && (
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl bg-[#0B0C10] border border-white/10 py-2 shadow-2xl focus:outline-none ring-1 ring-black ring-opacity-5">
                            <div className="max-h-60 overflow-auto custom-scrollbar">
                                {options.map((option) => (
                                    <Listbox.Option
                                        key={option.id || option.value}
                                        value={option.value}
                                        className={({ active }) =>
                                            `relative cursor-pointer select-none py-3 px-4 transition-colors ${active ? 'bg-white/5' : ''
                                            }`
                                        }
                                    >
                                        {({ selected }) => (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {option.icon && (
                                                        <div className={`p-2 rounded-lg ${option.color ? option.color.split(' ')[1] : 'bg-white/5'}`}>
                                                            {React.createElement(option.icon, {
                                                                className: `w-4 h-4 ${option.color ? option.color.split(' ')[0] : ''}`
                                                            })}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className={`font-bold text-sm ${selected ? 'text-indigo-400' : 'text-gray-300'}`}>
                                                            {option.label}
                                                        </p>
                                                        {option.description && (
                                                            <p className="text-[10px] text-gray-500 font-medium">{option.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {selected && (
                                                    <Check className="w-4 h-4 text-indigo-400" />
                                                )}
                                            </div>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </div>
                        </Listbox.Options>
                    </Transition>
                )}
            </div>
        </Listbox>
    );
};

export default CustomListbox;
