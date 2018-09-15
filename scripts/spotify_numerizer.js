let NUMBER_FORMAT = null
let AFFECTED_URL_TYPES = null

/**
 * Returns one of the following types for the current url as string:
 * 'playlist', 'album', 'collection' or 'other'
 */
function getUrlType() {
  let url = document.location.href

  if(url.match(/http(s)?:\/\/open\.spotify\.com\/playlist\/.+/) != null)
    return 'playlist'

  if(url.match(/http(s)?:\/\/open\.spotify\.com\/album\/.+/) != null)
    return 'album'

  if(url.match(/http(s)?:\/\/open\.spotify\.com\/collection\/tracks/) != null)
    return 'collection'

  return 'other' // = Nothing of the above
}

/**
 * Returns true if the urlType from getUrlType() is affected, otherwise false
 */
function isUrlAffected() {
  let urlType = getUrlType()

  if(urlType === 'playlist' && AFFECTED_URL_TYPES.includes('playlists'))
    return true

  if(urlType === 'album' && AFFECTED_URL_TYPES.includes('albums'))
    return true

  if(urlType === 'collection' && AFFECTED_URL_TYPES.includes('collection'))
    return true

  return false
}

/**
 * Returns a list of all TracklistNodes in the document
 */
function getTracklistNodes() {
  return document.querySelectorAll('.tracklist')
}

let currentlyModifyingAnyTracklist = false // to prevent recursive calls when updating/numerizing elements in the dom

/**
 * Executes the given callback when a change in any TracklistNode was detected,
 * that was caused by an external source (not the numerize()-Function)
 */
function attachTracklistModificationListeners(onTracklistModifiedByExternalSource) {
  let onEvent = (event) => {
    if(!currentlyModifyingAnyTracklist)
      onTracklistModifiedByExternalSource()
  }

  for(trackList of getTracklistNodes()) {
    trackList.addEventListener('DOMNodeInserted', onEvent)
    trackList.addEventListener('DOMNodeRemoved', onEvent)
  }
}

/**
 * Waits for the first TracklistNode to load, attaches listeners
 * and numerizes all (at that point loaded) TracklistNodes
 */
function attachListenersAndNumerizeDocument() {
  waitForTracklist(() => { // At least one tracklist loaded
    numerize()
    attachTracklistModificationListeners(numerize)
  })
}

/**
 * Executes given callbackOnLoaded-Function when at least one TracklistNode
 * gets detected.
 */
function waitForTracklist(callbackOnLoaded) {
  if(!isUrlAffected())
    return

  if(getTracklistNodes().length > 0)
    callbackOnLoaded()
  else
    setTimeout(waitForTracklist, 5, callbackOnLoaded)
}

/**
 * Invokes numerization for all available TracklistNodes (usually one of such).
 */
function numerize() {
  for(trackListNode of getTracklistNodes())
    numerizeTracklist(trackListNode)
}

function hasClass(node, className) {
  return node.classList != null && node.classList.contains(className)
}

/**
 * Returns the span-element/iconNode which contains the note-symbol
 */
function getIconNode(songNode) {
  if(songNode.tagName === 'DIV') // = Playable track
    return songNode.querySelector('.tracklist-row div span')
  else if(songNode.tagName === 'LI'
           && hasClass(songNode, 'tracklist-row-unplayable')) // = Unplayable track
    return songNode.querySelector('div div span')
}

/**
 * Numerizes a given TracklistNode
 *
 * During numerization the global 'currentlyModifyingAnyTracklist'-Boolean is
 * set to true, to prevent fired modification events mistake those modifications
 * as external changes by the website (e.g. when the user scrolls down
 * and spotify loads more tracks).
 */
function numerizeTracklist(trackListNode) {
  currentlyModifyingAnyTracklist = true

  let songNumber = 0
  for(songNode of trackListNode.children) {
    let iconNode = getIconNode(songNode)
    if(iconNode === null) continue // = IconNode not found. Shouldn't happen.

    songNumber++

    if(hasClass(iconNode, 'spoticon-track-16')) { // = Not numerized yet
      iconNode.classList = '' // Removes icon class (.spoticon-track-16)
      iconNode.innerHTML = NUMBER_FORMAT.replace('%num%', songNumber)
    }

  }

  currentlyModifyingAnyTracklist = false
}


let initialized = false

/**
 * Executed only once when this script is loaded and the user-settings got
 * retreived from the background task (background.js).
 */
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
    if(isUrlAffected())
      attachListenersAndNumerizeDocument()
  }, 50)
  // ----------------------------------
  initialized = true
}

// Requests the user-settings:
chrome.runtime.sendMessage('get_storage', (itemsFromStorage) => {
  NUMBER_FORMAT = itemsFromStorage.number_format
  AFFECTED_URL_TYPES = itemsFromStorage.affected
  initialize()
})

// Display/activate (depends on browser) the page-action icon:
chrome.runtime.sendMessage('show_page_action', () => {})
