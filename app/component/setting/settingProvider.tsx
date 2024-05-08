import { Dispatch, createContext, useEffect, useReducer } from "react";

export interface SettingContextProps {
    debug: boolean;
    model: string;
    tools: string[];
}

let initialSetting: SettingContextProps = { debug: false, model: 'GPT3.5', tools: [] };
if (typeof window !== 'undefined') {
    const savedSetting = localStorage.getItem("setting");
    initialSetting = savedSetting ? JSON.parse(savedSetting) : initialSetting;
}

export const SettingContext = createContext<SettingContextProps>(initialSetting)
export const SettingDispatchContext = createContext<Dispatch<any>|undefined>(undefined)

const reducer = (setting: any, action: any) => {
    let newSetting;
    switch (action.type) {
        case 'TOGGLE_DEBUG':
            newSetting = { ...setting, debug: action.debug };
            return newSetting;
        case 'SET_MODEL':
            newSetting = { ...setting, model: action.model };
            return newSetting;
        case 'SET_TOOLS':
            newSetting = { ...setting, tools: action.tools };
            return newSetting;
        default:
            throw new Error('Bad Action Type');
    }
};

export const SettingProvider = ({children}: any) => {
    const [setting, dispatch] = useReducer(reducer, initialSetting);

    // Save the new state to localStorage
    useEffect(() => {
        localStorage.setItem("setting", JSON.stringify(setting));
    }, [setting]);

    return (
        <SettingContext.Provider value={setting}>
            <SettingDispatchContext.Provider value={dispatch}>
                {children}
            </SettingDispatchContext.Provider>
        </SettingContext.Provider>
    )
}