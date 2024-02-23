import React, { useContext, createContext, Fragment, useMemo, useCallback, useEffect } from "react";
import { ModelProviderProps, UseModelProps } from "./type";
import { useRouter } from "next/navigation";

const isServer = typeof window === 'undefined'
const DEFAULTMODEL = "GPT3.5"
const ModelContext = createContext<UseModelProps | undefined>(undefined)
const defaultContext: UseModelProps = { setModel: _ => {}, models: [] }

export const useModel = () => useContext(ModelContext) ?? defaultContext
export const ModelProvider: React.FC<ModelProviderProps> =  props => {
  const context = useContext(ModelContext)

  // Ignore nested context providers, just passthrough children
  if (context) return <Fragment>{props.children}</Fragment>
  return <Model {...props} />
}

const defaultModels = ["GPT3.5", "GPT4"]
export const Model: React.FC<ModelProviderProps> = ({ 
  models = defaultModels,
  defaultModel = DEFAULTMODEL,
  storageKey = "model",
  children,
}) => {
  const [model, setModelState] = React.useState(() => getModel(storageKey, defaultModel))
  const router = useRouter()

  const setModel = useCallback(
    (model:string) => {
      setModelState(model)

      // Save to storage
      try {
        localStorage.setItem(storageKey, model)
        router.push(`/chat`)
        router.refresh()
      } catch (e) {
        // Unsupported
      }
    },
    []
  )

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) {
        return
      }

      // If default theme set, use it if localstorage === null (happens on local storage manual deletion)
      const model = e.newValue || defaultModel
      setModel(model)
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [setModel])
  
  const providerValue = useMemo(() => ({ model, setModel, models }), [model, setModel, models])

  return (
    <ModelContext.Provider value={providerValue}>
      {children}
    </ModelContext.Provider>
  )
}

const getModel = (key: string, fallback?: string) => {
  if (isServer) return undefined
  let model
  try {
    model = localStorage.getItem(key) || undefined
  } catch (e) {
    // Unsupported
  }
  return model || fallback
}