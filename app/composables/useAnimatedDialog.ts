// Shared open/close mechanics for a native <dialog> with a subtle fade+scale
// transition. Native <dialog>'s CSS-only exit transition (@starting-style +
// `overlay`/`display` allow-discrete) is inconsistently supported across
// browsers for the *closing* side specifically, so instead we drive the
// animation with a plain class toggle and only call the real close() once
// it's finished fading out — a plain opacity/transform transition on an
// element that stays rendered throughout, which is supported everywhere.
//
// Pair with scoped CSS in the consuming component, e.g.:
//
//   .my-modal { opacity: 0; transform: scale(0.97); transition: opacity 0.15s ease-out, transform 0.15s ease-out; }
//   .my-modal.is-visible { opacity: 1; transform: scale(1); }
//   .my-modal::backdrop { opacity: 0; transition: opacity 0.15s ease-out; }
//   .my-modal.is-visible::backdrop { opacity: 1; }
export function useAnimatedDialog() {
  const dialogRef = ref<HTMLDialogElement | null>(null);
  const visible = ref(false);

  function open() {
    dialogRef.value?.showModal();
    // Wait a frame so the browser paints the "hidden" state first — toggling
    // the class in the same tick as showModal() can otherwise skip straight
    // to the end state with no visible transition.
    requestAnimationFrame(() => {
      visible.value = true;
    });
  }

  function close() {
    if (!visible.value) return;
    visible.value = false;

    const dialog = dialogRef.value;
    if (!dialog) return;
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== dialog || e.propertyName !== "opacity") return;
      dialog.removeEventListener("transitionend", onTransitionEnd);
      dialog.close();
    };
    dialog.addEventListener("transitionend", onTransitionEnd);
  }

  // Escape triggers the native `cancel` → `close` immediately, skipping our
  // fade-out — intercept it and animate closed the same way as any other close.
  function onCancel(e: Event) {
    e.preventDefault();
    close();
  }

  function onBackdropClick(e: MouseEvent) {
    if (e.target === dialogRef.value) close();
  }

  return { dialogRef, visible, open, close, onCancel, onBackdropClick };
}
