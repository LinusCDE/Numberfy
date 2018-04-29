const BG = chrome.extension.getBackgroundPage()
const STORAGE_ITEMS = BG.getStorage()

function getAffected() {
  let affectedList = []
  for(checkBox of document.getElementsByName('affected')) {
    if(checkBox.checked)
      affectedList.push(checkBox.value)
  }
  return affectedList
}

function selectAffected(affectedList) {
  for(checkBox of document.getElementsByName('affected'))
      checkBox.checked = affectedList.includes(checkBox.value)
}

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
  BG.updateStorage({
    number_format: getNumberFormatValue(),
    affected: getAffected()
  })
}

document.addEventListener('DOMContentLoaded', () => {
  BG.getStorage((items) => {
    console.log(items)
    selectNumberFormatValue(items.number_format)
    selectAffected(items.affected)
  })
  document.getElementById('save-button').addEventListener('click', saveSettings)
})
