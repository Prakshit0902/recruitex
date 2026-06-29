"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | null>(null)

function Select({
  value,
  onValueChange,
  children,
}: {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      {children}
    </SelectContext.Provider>
  )
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const ctx = React.useContext(SelectContext)

  return (
    <button
      data-slot="select-trigger"
      onClick={() => ctx?.setOpen(!ctx.open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs transition-all placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown size={15} className="text-muted-foreground" />
    </button>
  )
}

function SelectValue({
  className,
  placeholder,
  ...props
}: React.ComponentProps<"span"> & { placeholder?: string }) {
  const ctx = React.useContext(SelectContext)
  return (
    <span
      data-slot="select-value"
      className={cn("text-sm", !ctx?.value && "text-muted-foreground/60", className)}
      {...props}
    >
      {ctx?.value || placeholder || "Select..."}
    </span>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const ctx = React.useContext(SelectContext)
  if (!ctx?.open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        data-slot="select-content"
        className={cn(
          "absolute z-50 mt-1 w-full min-w-[8rem] rounded-xl border border-border/50 bg-card shadow-lg backdrop-blur-xl p-1",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

function SelectItem({
  className,
  value,
  children,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const ctx = React.useContext(SelectContext)
  const isSelected = ctx?.value === value

  return (
    <button
      data-slot="select-item"
      data-selected={isSelected}
      onClick={() => {
        ctx?.onValueChange(value)
        ctx?.setOpen(false)
      }}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors",
        isSelected
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
