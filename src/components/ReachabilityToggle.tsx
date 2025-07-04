import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { cn } from "@/lib/utils"


export function ReachabilityToggle({
    defaultValue = false,
    onToggle,
  }: {
    defaultValue?: boolean
    onToggle?: (val: boolean) => void
  }) {
    const [enabled, setEnabled] = useState(!defaultValue)
  
    const handleChange = (value: boolean) => {
      setEnabled(value)
      onToggle?.(!value)
    }
  
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dnd-toggle" className="text-base font-medium">
              Do Not Disturb
            </Label>
            <Switch
              id="dnd-toggle"
              checked={enabled}
              onCheckedChange={handleChange}
            />
          </div>
          <p className={cn("text-sm text-muted-foreground")}>
            When enabled, you’ll appear as <strong className={cn(enabled ? "text-red-500 uppercase" : "")}>not reachable</strong> in the market.
            This lets you stay visible but prevents buyers from initiating contact.
          </p>
        </CardContent>
      </Card>
    )
  }
  