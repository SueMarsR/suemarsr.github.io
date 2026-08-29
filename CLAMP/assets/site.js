export async function copyText(text, clipboard) {
  if (!clipboard || typeof clipboard.writeText !== "function") {
    return false;
  }

  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function initializeCitationCopy() {
  const button = document.querySelector("[data-copy-citation]");
  const citation = document.querySelector("#bibtex code");
  const status = document.querySelector("#copy-status");

  if (!button || !citation || !status) {
    return;
  }

  button.addEventListener("click", async () => {
    const copied = await copyText(
      citation.textContent.trim(),
      globalThis.navigator?.clipboard,
    );

    status.textContent = copied
      ? "BibTeX copied to your clipboard."
      : "Copy was blocked. Select the citation text or download the .bib file.";
    if (copied) {
      button.textContent = "Copied";
      globalThis.setTimeout(() => {
        button.textContent = "Copy BibTeX";
      }, 1800);
    }
  });
}

if (typeof document !== "undefined") {
  initializeCitationCopy();
}
