'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'

import { TooltipProvider } from '@/app/ui/tooltip'
import { SettingProvider } from './setting/settingProvider'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <TooltipProvider>
        <SettingProvider>{children}</SettingProvider>
      </TooltipProvider>
    </NextThemesProvider>
  )
}
