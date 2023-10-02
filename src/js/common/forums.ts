import $ from "jquery";

export const addTooSmallLabel = (element: HTMLElement) => {
    const span = document.createElement("span");
    span.textContent = "The input is too short (min 3 characters)";
    span.setAttribute("class", "discussions_search_bar-text_input-error");
    $(span).hide().appendTo(element.parentElement).fadeIn(500);
    setTimeout(() => {
        $(span).fadeOut(500, () => {
            span.remove();
        });
    }, 2500);
}
