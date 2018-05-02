let NUMBER_FORMAT = null
let AFFECTED = null


/**
 * Checks if the url is matching and the user wants the certain type to be numerized
 */
function isTracklistSupportedUrl() {
  let url = document.location.href

  if(AFFECTED.includes('playlists') && url.match(/http(s)?:\/\/open\.spotify\.com\/user\/.+\/playlist\/.+/) != null)
    return true

  if(AFFECTED.includes('albums') && url.match(/http(s)?:\/\/open\.spotify\.com\/album\/.+/) != null)
    return true

  if(AFFECTED.includes('collection') && url.match(/http(s)?:\/\/open\.spotify\.com\/collection\/tracks/) != null)
    return true

  return false
}

/**
 * Checks if at least one tracklist exists
 */
function isTracklistDomAvailable() {
  let tracklistNodes = document.querySelectorAll('.tracklist')
  if(tracklistNodes.length == 0) return false
  return true
}

function hasClass(element, className) {
  if(element.classList == null) return false
  return element.classList.contains(className)
}

/**
 * Called when a changed url is detected
 */
function onUrlChanged() {
  if(isTracklistSupportedUrl())
    numerizeTracklist(attachUpdateListener=true)
}

function onTracklistModified(event) {
  if(!ignoreModifications)
    numerizeTracklist()
}

let ignoreModifications = false // to prevent recursive calls when updating elements in the dom

/*
 * Replace icons with numbers in all found tracklists
 */
function numerizeTracklist(attachUpdateListener=false) {
  if(ignoreModifications) return

  if(!isTracklistDomAvailable() && isTracklistSupportedUrl()) {
    //console.log('Waiting for DOM..')
    setTimeout(() => { numerizeTracklist(attachUpdateListener) }, 5)
    return
  }

  ignoreModifications = true

  // Numerize:
  for(trackList of document.querySelectorAll('.tracklist')) {
    // Listen for changes:
    if(attachUpdateListener) {
      trackList.addEventListener('DOMNodeInserted', onTracklistModified)
      trackList.addEventListener('DOMNodeRemoved', onTracklistModified)
    }

    let songNumber = 0
    for(songNode of trackList.children) {
      if(songNode.tagName === 'DIV') // = Playable track
        iconSpan = songNode.querySelector('.tracklist-row div span')
      else if(songNode.tagName === 'LI'
               && hasClass(songNode, 'tracklist-row-unplayable')) // = Unplayable track
        iconSpan = songNode.querySelector('div div span')

      if(iconSpan == null) continue // = Was already numerized
      songNumber++
      if(iconSpan.classList.contains('spoticon-track-16')) {
        iconSpan.classList = '' // Removes icon class (.spoticon-track-16)
        iconSpan.innerHTML = NUMBER_FORMAT.replace('%num%', `${songNumber}`)
      }
    }
  }

  ignoreModifications = false
}

let initialized = false
function initialize() {
  if(initialized) return

  // ----------------------------------
  // Url change checker:
  let lastUrl = null
  setInterval(() => {
    let url = document.location.href
    if(url === lastUrl) return

    // Url changed:
    lastUrl = url
    onUrlChanged()
  }, 50)
  // ----------------------------------
  initialized = true
}

chrome.runtime.sendMessage('get_storage', (items) => {
  NUMBER_FORMAT = items.number_format
  AFFECTED = items.affected
  initialize()
})
chrome.runtime.sendMessage('page_action_show', () => {})
