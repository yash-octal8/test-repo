import { RadioGroup, Radio } from '@headlessui/react';
import { CheckCircleIcon } from 'lucide-react';

export default function RadioButtonGroup ({
                                              options = [],
                                              valueKey = 'name',
                                              selected,
                                              onChange,
                                              label = 'Select Option',
                                          }) {
    return (
        <div className="w-full">
            <div className="mx-auto w-full max-w-md">
                <RadioGroup by={valueKey} value={selected} onChange={onChange} aria-label={label} className="flex gap-3">
                    {options?.map((item) => (
                        <Radio key={item[valueKey]} value={item} className="group relative flex cursor-pointer rounded-lg bg-white/5 px-5 py-4 shadow-md transition
              focus:not-data-focus:outline-none data-checked:bg-white/10 data-focus:outline data-focus:outline-white">
                            <div className="flex w-full items-center justify-between">
                                <div className="text-sm/6">
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <span className="font-semibold">{item.name}</span>
                                    </div>
                                  
                                    {/* If you have other fields */}
                                    {item.details && (
                                        <div className="flex gap-2">
                                            {item.details.map((d, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    {index > 0 &&
                                                    <span>&middot;</span>}
                                                    <span>{d}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <CheckCircleIcon 
                                    className="size-6 ml-2 opacity-0 transition group-data-checked:opacity-100"/>
                            </div>
                        </Radio>
                    ))}
                </RadioGroup>
            </div>
        </div>
    );
}
