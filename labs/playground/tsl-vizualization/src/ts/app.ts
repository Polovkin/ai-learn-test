import { getDomElements } from "./dom";
import { renderApp } from "./render";
import { createInitialState, stepParty } from "./state";

export function startApp(): void {
    const elements = getDomElements();
    let state = createInitialState();

    elements.alice.publicButton.addEventListener("click", () => {
        state = stepParty(state, "alice", "public");
        renderApp(elements, state);
    });

    elements.alice.sharedButton.addEventListener("click", () => {
        state = stepParty(state, "alice", "shared");
        renderApp(elements, state);
    });

    elements.bob.publicButton.addEventListener("click", () => {
        state = stepParty(state, "bob", "public");
        renderApp(elements, state);
    });

    elements.bob.sharedButton.addEventListener("click", () => {
        state = stepParty(state, "bob", "shared");
        renderApp(elements, state);
    });

    elements.resetButton.addEventListener("click", () => {
        state = createInitialState();
        renderApp(elements, state);
    });

    renderApp(elements, state);
}
