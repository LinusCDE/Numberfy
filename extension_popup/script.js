const BACKGROUND_PAGE = chrome.extension.getBackgroundPage()
const STORAGE_ITEMS = BACKGROUND_PAGE.getStorage()

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
  for(radioBtn of document.getElementsByName('number_format'))
      radioBtn.checked = (radioBtn.value === value)
}

function saveSettings() {
  BACKGROUND_PAGE.updateStorage({
    number_format: getNumberFormatValue(),
    affected: getAffected()
  })

  let setHintDisplayed = (display) => {
    document.getElementById('apply-hint').style.display = display ? 'block' : 'none'
  }

  setHintDisplayed(true)
  setTimeout(setHintDisplayed, 5000, false)
}

document.addEventListener('DOMContentLoaded', () => {
  BACKGROUND_PAGE.getStorage((items) => {
    console.log(items)
    selectNumberFormatValue(items.number_format)
    selectAffected(items.affected)
  })
  document.getElementById('save-button').addEventListener('click', saveSettings)
})
