import { JSX } from "preact/jsx-runtime";

export function renderWhen(condition: boolean, element: JSX.Element) {
    return condition ? element : null;
}