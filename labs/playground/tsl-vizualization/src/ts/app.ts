import { getDomElements } from "./dom";
import { renderApp } from "./render";
import { createInitialState, stepState } from "./state";

export function startApp(): void {
    const elements = getDomElements();
    let state = createInitialState();

    elements.nextButton.addEventListener("click", () => {
        state = stepState(state);
        renderApp(elements, state);
    });

    elements.resetButton.addEventListener("click", () => {
        state = createInitialState();
        renderApp(elements, state);
    });

    renderApp(elements, state);
}
