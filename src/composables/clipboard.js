import { toast } from './useToast'

export async function copyText (text, label = 'Copied to clipboard') {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  toast(label, { type: 'success' })
}

export async function readClipboard () {
  try {
    return await navigator.clipboard.readText()
  } catch {
    toast('Clipboard access was blocked. Press ⌘V / Ctrl+V in the field instead.', { type: 'warning', timeout: 4000 })
    return null
  }
}

export function downloadText (text, filename, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function readFileAsText (file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(r.error)
    r.readAsText(file)
  })
}
