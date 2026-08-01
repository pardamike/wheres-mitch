import { createSvgElement, svgText, type SvgAttributes } from '../svg-dom';

export const INK = '#172033';
export const PAPER = '#F7F0DE';
export const NAVY = '#273E68';
export const TURTLE_GREEN = '#718C51';
export const SHELL_GREEN = '#3F7D4D';

export function appendShape<K extends keyof SVGElementTagNameMap>(
  parent: SVGElement,
  tagName: K,
  attributes: SvgAttributes,
): SVGElementTagNameMap[K] {
  const element = createSvgElement(tagName, attributes);
  parent.append(element);
  return element;
}

export function appendText(
  parent: SVGElement,
  value: string,
  attributes: SvgAttributes,
): SVGTextElement {
  const element = svgText(value, attributes);
  parent.append(element);
  return element;
}

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function lerp(first: number, second: number, progress: number): number {
  return first + (second - first) * clamp(progress, 0, 1);
}

export function easeOutCubic(progress: number): number {
  const inverse = 1 - clamp(progress, 0, 1);
  return 1 - inverse * inverse * inverse;
}

export function easeInOutQuad(progress: number): number {
  const safe = clamp(progress, 0, 1);
  return safe < 0.5 ? 2 * safe * safe : 1 - (-2 * safe + 2) ** 2 / 2;
}
