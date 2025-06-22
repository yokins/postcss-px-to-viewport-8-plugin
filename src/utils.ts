import type { OptionType, ParentExtendType } from './types';

export const getUnit = (prop: string | string[], opts: OptionType) => {
  return prop.indexOf('font') === -1 ? opts.viewportUnit : opts.fontViewportUnit;
};

export const createPxReplace = (
  opts: OptionType,
  viewportUnit: string | number,
  viewportSize: number,
) => {
  return function (m: any, $1: string) {
    if (!$1) return m;
    const pixels = parseFloat($1);
    if (pixels <= opts.minPixelValue!) return m;
    const parsedVal = toFixed((pixels / viewportSize) * 100, opts.unitPrecision!);

    // 如果设置了最大视口宽度（maxViewportWidth）
    if (opts.maxViewportWidth) {
      // 获取当前屏幕宽度（一般为 window.innerWidth 或其他方式获取）
      const currentViewportWidth = Math.min(window.innerWidth, opts.maxViewportWidth);

      // 计算vw值，基于当前视口宽度
      const vwValue = (pixels / currentViewportWidth) * 100;

      // 返回min()函数，限制最大宽度
      return `min(${toFixed(vwValue, opts.unitPrecision!)}${viewportUnit}, ${pixels * (opts.maxViewportWidth / viewportSize)}px)`;
    }

    return parsedVal === 0 ? '0' : `${parsedVal}${viewportUnit}`;
  };
};

export const toFixed = (number: number, precision: number) => {
  const multiplier = Math.pow(10, precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
};

export const blacklistedSelector = (blacklist: string[], selector: string) => {
  if (typeof selector !== 'string') return;
  return blacklist.some((regex) => {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;
    return selector.match(regex);
  });
};

export const isExclude = (reg: RegExp, file: string) => {
  if (Object.prototype.toString.call(reg) !== '[object RegExp]') {
    throw new Error('options.exclude should be RegExp.');
  }
  return file.match(reg) !== null;
};

export const declarationExists = (decls: ParentExtendType[], prop: string, value: string) => {
  return decls?.some((decl: ParentExtendType) => {
    return decl.prop === prop && decl.value === value;
  });
};

export const validateParams = (params: string, mediaQuery: boolean) => {
  return !params || (params && mediaQuery);
};
