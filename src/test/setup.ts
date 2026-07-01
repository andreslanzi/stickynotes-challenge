import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement the Pointer Capture APIs our drag/resize hooks
// call (setPointerCapture/releasePointerCapture). Stub them so gesture
// handlers can run in tests without throwing.
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = function () {}
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = function () {}
}
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = function () {
    return false
  }
}
