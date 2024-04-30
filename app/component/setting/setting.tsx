'use client'
import { cn } from "@/app/lib/utils"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/app/ui/dialog"
import { IconMenu } from "@/app/ui/icons"
import { useContext, useState } from "react";
import { SettingContext, SettingDispatchContext } from "./settingProvider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/ui/select"
import { Switch } from "@/app/ui/switch";
import { CheckboxGroup } from "@/app/ui/checkgroup";

const models = ["GPT3.5", "GPT4", "Dalle3"]

export function Setting () {
    const [ showMenu, setShowMenu ] = useState<boolean>(false)
    const {model, debug, tools} = useContext(SettingContext)
    const dispatch = useContext(SettingDispatchContext)

    const setModel = (model: string) => {
        dispatch?.({type: "SET_MODEL", model})
    }

    const toggleDebug = (debug: boolean) => {
        dispatch?.({type: "TOGGLE_DEBUG", debug})
    }

    const setTools = (tools: string[]) => {
        dispatch?.({type: "SET_TOOLS", tools})
    }

    return (
        <Dialog open={showMenu} onOpenChange={(isOpen) => {
            setShowMenu(isOpen)
        }}>
            <DialogTrigger asChild>
                <button
                    className="bg-transparent hover:text-primary text-primary/80 font-bold">
                    <IconMenu/>
                </button>
            </DialogTrigger>
            <DialogContent className={cn(
                "bg-white"
            )}>
                <DialogTitle className="mb-4">Setting</DialogTitle>
                <fieldset className="flex gap-5 items-center mb-2">
                    <label className="text-right w-24 font-bold text-foreground/80" htmlFor="name">
                        模型
                    </label>
                    <div className="flex items-center justify-between w-28">
                        <Select value={model} onValueChange={setModel}>
                            <SelectTrigger className="SelectTrigger"> 
                                <SelectValue>{model}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {models.map((model) => (
                                <SelectItem value={model} key={model}>
                                    {model}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </fieldset>
                <fieldset className="flex gap-5 items-center mb-2">
                    <label className="text-right w-24 font-bold text-foreground/80" htmlFor="name">
                        Debug
                    </label>
                    <Switch defaultChecked={debug} onCheckedChange={toggleDebug}/>
                </fieldset>
                <fieldset className="flex gap-5 items-center mb-2">
                    <label className="text-right w-24 font-bold text-foreground/80" htmlFor="name">
                        Tools
                    </label>
                    <CheckboxGroup handleChanges={setTools} values={tools} options={[
                        {label: 'Text to Image', value: 'text_to_image'},
                        {label: 'Get Weather', value: 'get_weather'}
                    ]}/>
                </fieldset>
            </DialogContent>
        </Dialog>
    )
}
    