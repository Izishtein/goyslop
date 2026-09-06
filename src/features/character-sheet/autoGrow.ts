/** Textareas clip whatever does not fit their box, and print has no scrollbar — so each
 *  one grows to its content, on screen and on paper alike. */
export function autoGrow(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = 'auto';
  // scrollHeight is the content box; with border-box sizing the borders have to be added
  // back, or the last line ends up a pixel or two under the bottom edge.
  const borders = element.offsetHeight - element.clientHeight;
  element.style.height = `${element.scrollHeight + borders}px`;
}
