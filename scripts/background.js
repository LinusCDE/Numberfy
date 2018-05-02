// -------------------------------------------------------
// Storage:

let _STORAGE_ITEMS = { }

/**
 * Get storage with callback
 */
function getStorage(callback) {
  chrome.storage.sync.get({
    number_format: '%num%.',
    affected: ['playlists', 'albums', 'collection']
  }, (items) => {
    _STORAGE_ITEMS = Object.assign({}, items)
    callback(items)
  })
}

/**
 * Updates certain values in storage
 */
function updateStorage(items) {
  _STORAGE_ITEMS = Object.assign(_STORAGE_ITEMS, items)
  console.log(_STORAGE_ITEMS)
  chrome.storage.sync.set(_STORAGE_ITEMS)
}

// -------------------------------------------------------


// onMessage-Handler:
chrome.runtime.onMessage.addListener((request, sender, callbackFunc) => {
  if(request === 'get_storage') {
    getStorage((items) => {
      callbackFunc(items)
    })
    return true // Indicates to chrome that the callback is async and'll come later
  }

  if(request === 'page_action_show')
    chrome.pageAction.show(sender.tab.id)
})
