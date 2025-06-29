"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _pixelUnitRegexp = require("./pixel-unit-regexp");
var _propListMatcher = require("./prop-list-matcher");
var _utils = require("./utils");
var _objectAssign = _interopRequireDefault(require("object-assign"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const defaults = {
  unitToConvert: 'px',
  viewportWidth: 320,
  maxViewportWidth: null,
  viewportHeight: 568,
  // not now used; TODO: need for different units and math for different properties
  unitPrecision: 5,
  viewportUnit: 'vw',
  fontViewportUnit: 'vw',
  // vmin is more suitable.
  selectorBlackList: [],
  propList: ['*'],
  minPixelValue: 1,
  mediaQuery: false,
  replace: true,
  landscape: false,
  landscapeUnit: 'vw',
  landscapeWidth: 568
};
const ignoreNextComment = 'px-to-viewport-ignore-next';
const ignorePrevComment = 'px-to-viewport-ignore';
const postcssPxToViewport = options => {
  const opts = (0, _objectAssign.default)({}, defaults, options);
  const pxRegex = (0, _pixelUnitRegexp.getUnitRegexp)(opts.unitToConvert);
  const satisfyPropList = (0, _propListMatcher.createPropListMatcher)(opts.propList);
  const landscapeRules = [];
  return {
    postcssPlugin: 'postcss-px-to-viewport',
    Once(css, {
      result
    }) {
      // @ts-ignore 补充类型
      css.walkRules(rule => {
        // Add exclude option to ignore some files like 'node_modules'
        const file = rule.source?.input.file || '';
        if (opts.exclude && file) {
          if (Object.prototype.toString.call(opts.exclude) === '[object RegExp]') {
            if ((0, _utils.isExclude)(opts.exclude, file)) return;
          } else if (
          // Object.prototype.toString.call(opts.exclude) === '[object Array]' &&
          opts.exclude instanceof Array) {
            for (let i = 0; i < opts.exclude.length; i++) {
              if ((0, _utils.isExclude)(opts.exclude[i], file)) return;
            }
          } else {
            throw new Error('options.exclude should be RegExp or Array.');
          }
        }
        if ((0, _utils.blacklistedSelector)(opts.selectorBlackList, rule.selector)) return;
        if (opts.landscape && !rule.parent?.params) {
          const landscapeRule = rule.clone().removeAll();
          rule.walkDecls(decl => {
            if (decl.value.indexOf(opts.unitToConvert) === -1) return;
            if (!satisfyPropList(decl.prop)) return;
            let landscapeWidth;
            if (typeof opts.landscapeWidth === 'function') {
              const num = opts.landscapeWidth(file);
              if (!num) return;
              landscapeWidth = num;
            } else {
              landscapeWidth = opts.landscapeWidth;
            }
            landscapeRule.append(decl.clone({
              value: decl.value.replace(pxRegex, (0, _utils.createPxReplace)(opts, opts.landscapeUnit, landscapeWidth))
            }));
          });
          if (landscapeRule.nodes.length > 0) {
            landscapeRules.push(landscapeRule);
          }
        }
        if (!(0, _utils.validateParams)(rule.parent?.params, opts.mediaQuery)) return;
        rule.walkDecls((decl, i) => {
          if (decl.value.indexOf(opts.unitToConvert) === -1) return;
          if (!satisfyPropList(decl.prop)) return;
          const prev = decl.prev();
          // prev declaration is ignore conversion comment at same line
          if (prev && prev.type === 'comment' && prev.text === ignoreNextComment) {
            // remove comment
            prev.remove();
            return;
          }
          const next = decl.next();
          // next declaration is ignore conversion comment at same line
          if (next && next.type === 'comment' && next.text === ignorePrevComment) {
            if (/\n/.test(next.raws.before)) {
              result.warn(`Unexpected comment /* ${ignorePrevComment} */ must be after declaration at same line.`, {
                node: next
              });
            } else {
              // remove comment
              next.remove();
              return;
            }
          }
          let unit;
          let size;
          const {
            params
          } = rule.parent;
          if (opts.landscape && params && params.indexOf('landscape') !== -1) {
            unit = opts.landscapeUnit;
            if (typeof opts.landscapeWidth === 'function') {
              const num = opts.landscapeWidth(file);
              if (!num) return;
              size = num;
            } else {
              size = opts.landscapeWidth;
            }
          } else {
            unit = (0, _utils.getUnit)(decl.prop, opts);
            if (typeof opts.viewportWidth === 'function') {
              const num = opts.viewportWidth(file);
              if (!num) return;
              size = num;
            } else {
              size = opts.viewportWidth;
            }
          }
          const value = decl.value.replace(pxRegex, (0, _utils.createPxReplace)(opts, unit, size));
          if ((0, _utils.declarationExists)(decl.parent, decl.prop, value)) return;
          if (opts.replace) {
            decl.value = value;
          } else {
            decl.parent?.insertAfter(i, decl.clone({
              value
            }));
          }
        });
      });

      // if (landscapeRules.length > 0) {
      //   const landscapeRoot = new AtRule({
      //     params: '(orientation: landscape)',
      //     name: 'media',
      //   });

      //   landscapeRules.forEach((rule) => {
      //     landscapeRoot.append(rule);
      //   });
      //   css.append(landscapeRoot);
      // }
    },
    // https://www.postcss.com.cn/docs/writing-a-postcss-plugin
    // Declaration Rule RuleExit OnceExit
    // There two types or listeners: enter and exit.
    // Once, Root, AtRule, and Rule will be called before processing children.
    // OnceExit, RootExit, AtRuleExit, and RuleExit after processing all children inside node.
    OnceExit(css, {
      AtRule
    }) {
      // 在 Once里跑这段逻辑，设置横屏时，打包后到生产环境竖屏样式会覆盖横屏样式，所以 OnceExit再执行。
      if (landscapeRules.length > 0) {
        const landscapeRoot = new AtRule({
          params: '(orientation: landscape)',
          name: 'media'
        });
        landscapeRules.forEach(function (rule) {
          landscapeRoot.append(rule);
        });
        css.append(landscapeRoot);
      }
    }
  };
};
postcssPxToViewport.postcss = true;
module.exports = postcssPxToViewport;
var _default = exports.default = postcssPxToViewport;