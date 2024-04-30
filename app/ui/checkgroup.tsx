import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

interface CheckboxGroupProp {
    options: { label: string; value: string }[];
    handleChanges: (selectedOptions: string[]) => void;
    values: string[];
}

function CheckboxGroup({options, handleChanges, values}: CheckboxGroupProp) {
    const [selected, setSelected] = useState<string[]>(values);

    const handleChange = (checked: boolean, value: string) => {
        if (checked && !selected.includes(value)) {
            setSelected([...selected, value])
            handleChanges([...selected, value])
        }
        if (!checked && selected.includes(value)) {
            setSelected(selected.filter((item) => item !== value))
            handleChanges(selected.filter((item) => item !== value))
        }
    };

    return (
        <div>
            {
                options.map((option) => (
                    <div className='flex items-cente gap-2 mb-2'>
                        <Checkbox.Root className="bg-background w-6 h-6 rounded flex items-center justify-center shadow-lg hover:bg-primary/10 focus:shadow-sm focus:shadow-black" 
                            checked={selected.includes(option.value)} value={option.value} onCheckedChange={(checked: boolean) => handleChange(checked, option.value)}>
                            <Checkbox.Indicator>
                                <CheckIcon />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <label className="Label" htmlFor="c1">
                            {option.label}
                        </label>
                    </div>
                ))
            }
        </div>
    );
}

export {CheckboxGroup}