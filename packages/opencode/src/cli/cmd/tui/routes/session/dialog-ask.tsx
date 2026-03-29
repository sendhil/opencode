import { TextAttributes } from "@opentui/core"
import { useTheme } from "@tui/context/theme"
import { useDialog } from "@tui/ui/dialog"
import { useSDK } from "@tui/context/sdk"
import { useLocal } from "@tui/context/local"
import { useToast } from "@tui/ui/toast"
import { createSignal, Show } from "solid-js"
import { useKeyboard } from "@opentui/solid"
import { Spinner } from "@tui/component/spinner"
import { DialogPrompt } from "@tui/ui/dialog-prompt"
import type { DialogContext } from "@tui/ui/dialog"

function DialogAskResult(props: { question: string; answer: string }) {
  const dialog = useDialog()
  const { theme } = useTheme()

  useKeyboard((evt) => {
    if (evt.name === "return" || evt.name === "escape") {
      dialog.clear()
    }
  })

  return (
    <box paddingLeft={2} paddingRight={2} gap={1}>
      <box flexDirection="row" justifyContent="space-between">
        <text attributes={TextAttributes.BOLD} fg={theme.text}>
          Ask
        </text>
        <text fg={theme.textMuted} onMouseUp={() => dialog.clear()}>
          esc
        </text>
      </box>
      <box>
        <text fg={theme.textMuted}>{props.question}</text>
      </box>
      <box paddingBottom={1}>
        <text fg={theme.text}>{props.answer}</text>
      </box>
    </box>
  )
}

export function DialogAsk(props: { sessionID: string }) {
  const dialog = useDialog()
  const sdk = useSDK()
  const local = useLocal()
  const toast = useToast()
  const [busy, setBusy] = createSignal(false)

  const handleSubmit = async (question: string) => {
    if (!question.trim()) return
    const selectedModel = local.model.current()
    if (!selectedModel) {
      toast.show({
        variant: "warning",
        message: "Connect a provider to use /ask",
        duration: 3000,
      })
      return
    }
    setBusy(true)
    try {
      const res = await sdk.fetch(`${sdk.url}/session/${props.sessionID}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          providerID: selectedModel.providerID,
          modelID: selectedModel.modelID,
        }),
      })
      if (!res.ok) throw new Error("Failed to get answer")
      const data = (await res.json()) as { answer: string }
      dialog.replace(() => <DialogAskResult question={question.trim()} answer={data.answer} />)
    } catch (error) {
      setBusy(false)
      toast.show({
        message: error instanceof Error ? error.message : "Failed to get answer",
        variant: "error",
      })
    }
  }

  return (
    <DialogPrompt
      title="Ask"
      placeholder="Ask a question about the current session..."
      busy={busy()}
      busyText="Thinking..."
      onConfirm={handleSubmit}
      onCancel={() => dialog.clear()}
    />
  )
}

DialogAsk.show = (dialog: DialogContext, sessionID: string) => {
  dialog.replace(() => <DialogAsk sessionID={sessionID} />)
}
