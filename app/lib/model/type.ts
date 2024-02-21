interface ValueObject {
    [modelName: string]: string
  }

export interface UseModelProps{
    /** List of all available model names */
    models: string[]
    setModel: (model: string) => void
    model?: string | undefined
}

export interface ModelProviderProps {
    /** List of all available model names */
    models?: string[] | undefined
    /** Default model name */
    defaultModel?: string | undefined
    /** Key used to store model setting in localStorage */
    storageKey?: string | undefined

    children?: React.ReactNode
}