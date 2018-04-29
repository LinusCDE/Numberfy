const BG = chrome.extension.getBackgroundPage()
const STORAGE_ITEMS = BG.getStorage()

function getNumberFormatValue() {
  for(radioBtn of document.getElementsByName('number_format')) {
    if(radioBtn.checked)
      return radioBtn.value
  }
  return null
}

function selectNumberFormatValue(value) {
  for(radioBtn of document.getElementsByName('number_format')) {
    if(radioBtn.value === value)
      radioBtn.checked = true
  }
}

function saveSettings() {
  BG.updateStorage({number_format: getNumberFormatValue()})
}

document.addEventListener('DOMContentLoaded', () => {
  BG.getStorage((items) => {
    console.log(items)
    selectNumberFormatValue(items.number_format)
  })
  document.getElementById('save-button').addEventListener('click', saveSettings)
})
