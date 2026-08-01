export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export type SvgAttributes = Record<string, string | number | boolean | null | undefined>;

export function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tagName: K,
  attributes: SvgAttributes = {},
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NAMESPACE, tagName);
  setSvgAttributes(element, attributes);
  return element;
}

export function setSvgAttributes(element: Element, attributes: SvgAttributes): void {
  for (const [name, value] of Object.entries(attributes)) {
    if (value === null || value === undefined || value === false) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, value === true ? '' : String(value));
    }
  }
}

export function svgText(text: string, attributes: SvgAttributes = {}): SVGTextElement {
  const element = createSvgElement('text', attributes);
  element.textContent = text;
  return element;
}

export function findSvgLayer(stage: SVGSVGElement, layerName: string): SVGGElement {
  const layer = stage.querySelector<SVGGElement>(`[data-layer="${layerName}"]`);
  if (!layer) {
    throw new Error(`Required SVG layer is missing: ${layerName}`);
  }
  return layer;
}

export function clearSvg(element: SVGElement): void {
  element.replaceChildren();
}

export function setTransform(element: SVGElement, transform: string): void {
  element.setAttribute('transform', transform);
}
