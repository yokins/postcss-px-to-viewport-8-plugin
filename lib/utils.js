"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateParams = exports.toFixed = exports.isExclude = exports.getUnit = exports.declarationExists = exports.createPxReplace = exports.blacklistedSelector = void 0;
const getUnit = (prop, opts) => {
  return prop.indexOf('font') === -1 ? opts.viewportUnit : opts.fontViewportUnit;
};
exports.getUnit = getUnit;
const createPxReplace = (opts, viewportUnit, viewportSize) => {
  return function (m, $1) {
    if (!$1) return m;
    const pixels = parseFloat($1);
    if (pixels <= opts.minPixelValue) return m;
    let parsedVal = toFixed(pixels / viewportSize * 100, opts.unitPrecision);
    if (opts.maxViewportWidth && viewportSize > opts.maxViewportWidth) {
      parsedVal = toFixed(pixels / opts.maxViewportWidth * 100, opts.unitPrecision);
    }
    return parsedVal === 0 ? '0' : `${parsedVal}${viewportUnit}`;
  };
};
exports.createPxReplace = createPxReplace;
const toFixed = (number, precision) => {
  const multiplier = Math.pow(10, precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
};
exports.toFixed = toFixed;
const blacklistedSelector = (blacklist, selector) => {
  if (typeof selector !== 'string') return;
  return blacklist.some(regex => {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;
    return selector.match(regex);
  });
};
exports.blacklistedSelector = blacklistedSelector;
const isExclude = (reg, file) => {
  if (Object.prototype.toString.call(reg) !== '[object RegExp]') {
    throw new Error('options.exclude should be RegExp.');
  }
  return file.match(reg) !== null;
};
exports.isExclude = isExclude;
const declarationExists = (decls, prop, value) => {
  return decls?.some(decl => {
    return decl.prop === prop && decl.value === value;
  });
};
exports.declarationExists = declarationExists;
const validateParams = (params, mediaQuery) => {
  return !params || params && mediaQuery;
};
exports.validateParams = validateParams;