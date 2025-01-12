// Note: Using a modified form of the minified TSTL JSX framework provided by Pyry.
//
//   URL: https://gist.github.com/probable-basilisk/3d1ff2c9a932c03cfb598f02678951c3

import { IPWUIElementAttributes, PWUIElement } from './elements/PWUIElement';
import { IPWUIRadialMenuAttributes, PWUIRadialMenu } from './elements/PWUIRadialMenu';
import { IPWUITextAreaAttributes, PWUIText } from './elements/PWUIText';
import { Element, ElementChildren, ElementConstructor } from './PipeWrenchUI';

import * as JSON from './JSON';

/* ########################################################## */

// Element Interfaces
declare global {
  namespace JSX {
    interface IntrinsicElements {
      element: IPWUIElementAttributes;
      radialmenu: IPWUIRadialMenuAttributes;
      text: IPWUITextAreaAttributes;
    }
  }
}

// Element Classes.
export let primitives: { [name: string]: Element } = {
  element: PWUIElement,
  radialmenu: PWUIRadialMenu,
  text: PWUIText,
};

/* ########################################################## */

export namespace PipeWrenchUI {
  export const createElement = (
    t: string | Function | ElementConstructor,
    props?: object,
    ...children: any[]
  ): any => {
    props = props ?? {};
    let flatChildren = flattenChildren(children);
    if (typeof t == 'string') {
      if (primitives[t] == null) {
        print(`No base element [${t}]!`);
        return null;
      }
      return new (primitives[t] as any)(props, flatChildren);
    } else if (isActualFunction(t)) {
      return t(props, flatChildren);
    } else {
      return new (t as ElementConstructor)(props, flatChildren);
    }
  };

  function recursiveFlattenChildren(
    children: ElementChildren,
    target: Element[]
  ): void {
    if (typeof children == 'string') {
      target.push(new PWUIText({}, target, children));
    }
    else if (typeof children == 'object') {
      if (type(children) == 'table' && (children as any[])[0] != null) {
        for (const child of children as ElementChildren[]) {
          recursiveFlattenChildren(child, target);
        }
      } else {
        target.push(children);
      }
    }
    else {
      for (const child of children as ElementChildren[]) {
        recursiveFlattenChildren(child, target);
      }
    }
  }

  function flattenChildren(children: ElementChildren): Element[] {
    let result: Element[] = [];
    recursiveFlattenChildren(children, result);
    return result;
  }

  // TSTL and TS disagree on what `typeof MyClass` is, so to distinguish between class constructors and functions we
  // have to break out to Lua.
  function isActualFunction(f: unknown): f is (...args: any[]) => any {
    return type(f) == 'function';
  }
}

export const createUI = (...elements: Element[]) => {
  for (const element of elements) {
    if ((element as any).addToUIManager != null) {
      (element as any).addToUIManager();
    }
  }
};
