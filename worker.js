/**
 * Welcome to cf-xyblog
 */

// --- BEGIN: Mustache.js v4.1.0 ---
const mustache = (function () {
	'use strict';
	var objectToString = Object.prototype.toString;
	var isArray = Array.isArray || function isArrayPolyfill (object) { return objectToString.call(object) === '[object Array]'; };
	function isFunction (object) { return typeof object === 'function'; }
	function typeStr (obj) { return isArray(obj) ? 'array' : typeof obj; }
	function escapeRegExp (string) { return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'); }
	function hasProperty (obj, propName) { return obj != null && typeof obj === 'object' && (propName in obj); }
	function primitiveHasOwnProperty (primitive, propName) { return (primitive != null && typeof primitive !== 'object' && primitive.hasOwnProperty && primitive.hasOwnProperty(propName));}
	var regExpTest = RegExp.prototype.test;
	function testRegExp (re, string) { return regExpTest.call(re, string); }
	var nonSpaceRe = /\S/;
	function isWhitespace (string) { return !testRegExp(nonSpaceRe, string); }
	var entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' };
	function escapeHtml (string) { return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) { return entityMap[s]; }); }
	var whiteRe = /\s*/; var spaceRe = /\s+/; var equalsRe = /\s*=/; var curlyRe = /\s*\}/; var tagRe = /#|\^|\/|>|\{|&|=|!/;
	function parseTemplate (template, tags) { if (!template) return []; var lineHasNonSpace = false; var sections = []; var tokens = []; var spaces = []; var hasTag = false; var nonSpace = false; var indentation = ''; var tagIndex = 0; function stripSpace () { if (hasTag && !nonSpace) { while (spaces.length) delete tokens[spaces.pop()]; } else { spaces = []; } hasTag = false; nonSpace = false; } var openingTagRe, closingTagRe, closingCurlyRe; function compileTags (tagsToCompile) { if (typeof tagsToCompile === 'string') tagsToCompile = tagsToCompile.split(spaceRe, 2); if (!isArray(tagsToCompile) || tagsToCompile.length !== 2) throw new Error('Invalid tags: ' + tagsToCompile); openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*'); closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1])); closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1])); } compileTags(tags || mustache.tags); var scanner = new Scanner(template); var start, type, value, chr, token, openSection; while (!scanner.eos()) { start = scanner.pos; value = scanner.scanUntil(openingTagRe); if (value) { for (var i = 0, valueLength = value.length; i < valueLength; ++i) { chr = value.charAt(i); if (isWhitespace(chr)) { spaces.push(tokens.length); indentation += chr; } else { nonSpace = true; lineHasNonSpace = true; indentation += ' '; } tokens.push([ 'text', chr, start, start + 1 ]); start += 1; if (chr === '\n') { stripSpace(); indentation = ''; tagIndex = 0; lineHasNonSpace = false; } } } if (!scanner.scan(openingTagRe)) break; hasTag = true; type = scanner.scan(tagRe) || 'name'; scanner.scan(whiteRe); if (type === '=') { value = scanner.scanUntil(equalsRe); scanner.scan(equalsRe); scanner.scanUntil(closingTagRe); } else if (type === '{') { value = scanner.scanUntil(closingCurlyRe); scanner.scan(curlyRe); scanner.scanUntil(closingTagRe); type = '&'; } else { value = scanner.scanUntil(closingTagRe); } if (!scanner.scan(closingTagRe)) throw new Error('Unclosed tag at ' + scanner.pos); if (type == '>') { token = [ type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace ]; } else { token = [ type, value, start, scanner.pos ]; } tagIndex++; tokens.push(token); if (type === '#' || type === '^') { sections.push(token); } else if (type === '/') { openSection = sections.pop(); if (!openSection) throw new Error('Unopened section "' + value + '" at ' + start); if (openSection[1] !== value) throw new Error('Unclosed section "' + openSection[1] + '" at ' + start); } else if (type === 'name' || type === '{' || type === '&') { nonSpace = true; } else if (type === '=') { compileTags(value); } } stripSpace(); openSection = sections.pop(); if (openSection) throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos); return nestTokens(squashTokens(tokens)); } function squashTokens (tokens) { var squashedTokens = []; var token, lastToken; for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) { token = tokens[i]; if (token) { if (token[0] === 'text' && lastToken && lastToken[0] === 'text') { lastToken[1] += token[1]; lastToken[3] = token[3]; } else { squashedTokens.push(token); lastToken = token; } } } return squashedTokens; } function nestTokens (tokens) { var nestedTokens = []; var collector = nestedTokens; var sections = []; var token, section; for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) { token = tokens[i]; switch (token[0]) { case '#': case '^': collector.push(token); sections.push(token); collector = token[4] = []; break; case '/': section = sections.pop(); section[5] = token[2]; collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens; break; default: collector.push(token); } } return nestedTokens; } function Scanner (string) { this.string = string; this.tail = string; this.pos = 0; } Scanner.prototype.eos = function eos () { return this.tail === ''; }; Scanner.prototype.scan = function scan (re) { var match = this.tail.match(re); if (!match || match.index !== 0) return ''; var string = match[0]; this.tail = this.tail.substring(string.length); this.pos += string.length; return string; }; Scanner.prototype.scanUntil = function scanUntil (re) { var index = this.tail.search(re), match; switch (index) { case -1: match = this.tail; this.tail = ''; break; case 0: match = ''; break; default: match = this.tail.substring(0, index); this.tail = this.tail.substring(index); } this.pos += match.length; return match; }; function Context (view, parentContext) { this.view = view; this.cache = { '.': this.view }; this.parent = parentContext; } Context.prototype.push = function push (view) { return new Context(view, this); }; Context.prototype.lookup = function lookup (name) { var cache = this.cache; var value; if (cache.hasOwnProperty(name)) { value = cache[name]; } else { var context = this, intermediateValue, names, index, lookupHit = false; while (context) { if (name.indexOf('.') > 0) { intermediateValue = context.view; names = name.split('.'); index = 0; while (intermediateValue != null && index < names.length) { if (index === names.length - 1) lookupHit = (hasProperty(intermediateValue, names[index]) || primitiveHasOwnProperty(intermediateValue, names[index])); intermediateValue = intermediateValue[names[index++]]; } } else { intermediateValue = context.view[name]; lookupHit = hasProperty(context.view, name); } if (lookupHit) { value = intermediateValue; break; } context = context.parent; } cache[name] = value; } if (isFunction(value)) value = value.call(this.view); return value; }; function Writer () { this.templateCache = { _cache: {}, set: function set (key, value) { this._cache[key] = value; }, get: function get (key) { return this._cache[key]; }, clear: function clear () { this._cache = {}; } }; } Writer.prototype.clearCache = function clearCache () { if (typeof this.templateCache !== 'undefined') { this.templateCache.clear(); } }; Writer.prototype.parse = function parse (template, tags) { var cache = this.templateCache; var cacheKey = template + ':' + (tags || mustache.tags).join(':'); var isCacheEnabled = typeof cache !== 'undefined'; var tokens = isCacheEnabled ? cache.get(cacheKey) : undefined; if (tokens == undefined) { tokens = parseTemplate(template, tags); isCacheEnabled && cache.set(cacheKey, tokens); } return tokens; }; Writer.prototype.render = function render (template, view, partials, config) { var tags = this.getConfigTags(config); var tokens = this.parse(template, tags); var context = (view instanceof Context) ? view : new Context(view, undefined); return this.renderTokens(tokens, context, partials, template, config); }; Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate, config) { var buffer = ''; var token, symbol, value; for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) { value = undefined; token = tokens[i]; symbol = token[0]; if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate, config); else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate, config); else if (symbol === '>') value = this.renderPartial(token, context, partials, config); else if (symbol === '&') value = this.unescapedValue(token, context); else if (symbol === 'name') value = this.escapedValue(token, context, config); else if (symbol === 'text') value = this.rawValue(token); if (value !== undefined) buffer += value; } return buffer; }; Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate, config) { var self = this; var buffer = ''; var value = context.lookup(token[1]); function subRender (template) { return self.render(template, context, partials, config); } if (!value) return; if (isArray(value)) { for (var j = 0, valueLength = value.length; j < valueLength; ++j) { buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config); } } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') { buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config); } else if (isFunction(value)) { if (typeof originalTemplate !== 'string') throw new Error('Cannot use higher-order sections without the original template'); value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender); if (value != null) buffer += value; } else { buffer += this.renderTokens(token[4], context, partials, originalTemplate, config); } return buffer; }; Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate, config) { var value = context.lookup(token[1]); if (!value || (isArray(value) && value.length === 0)) return this.renderTokens(token[4], context, partials, originalTemplate, config); }; Writer.prototype.indentPartial = function indentPartial (partial, indentation, lineHasNonSpace) { var filteredIndentation = indentation.replace(/[^ \t]/g, ''); var partialByNl = partial.split('\n'); for (var i = 0; i < partialByNl.length; i++) { if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) { partialByNl[i] = filteredIndentation + partialByNl[i]; } } return partialByNl.join('\n'); }; Writer.prototype.renderPartial = function renderPartial (token, context, partials, config) { if (!partials) return; var tags = this.getConfigTags(config); var value = isFunction(partials) ? partials(token[1]) : partials[token[1]]; if (value != null) { var lineHasNonSpace = token[6]; var tagIndex = token[5]; var indentation = token[4]; var indentedValue = value; if (tagIndex == 0 && indentation) { indentedValue = this.indentPartial(value, indentation, lineHasNonSpace); } var tokens = this.parse(indentedValue, tags); return this.renderTokens(tokens, context, partials, indentedValue, config); } }; Writer.prototype.unescapedValue = function unescapedValue (token, context) { var value = context.lookup(token[1]); if (value != null) return value; }; Writer.prototype.escapedValue = function escapedValue (token, context, config) { var escape = this.getConfigEscape(config) || mustache.escape; var value = context.lookup(token[1]); if (value != null) return (typeof value === 'number' && escape === mustache.escape) ? String(value) : escape(value); }; Writer.prototype.rawValue = function rawValue (token) { return token[1]; }; Writer.prototype.getConfigTags = function getConfigTags (config) { if (isArray(config)) { return config; } else if (config && typeof config === 'object') { return config.tags; } else { return undefined; } }; Writer.prototype.getConfigEscape = function getConfigEscape (config) { if (config && typeof config === 'object' && !isArray(config)) { return config.escape; } else { return undefined; } }; var mustache = { name: 'mustache.js', version: '4.1.0', tags: [ '{{', '}}' ], clearCache: undefined, escape: undefined, parse: undefined, render: undefined, Scanner: undefined, Context: undefined, Writer: undefined, set templateCache (cache) { defaultWriter.templateCache = cache; }, get templateCache () { return defaultWriter.templateCache; } }; var defaultWriter = new Writer(); mustache.clearCache = function clearCache () { return defaultWriter.clearCache(); }; mustache.parse = function parse (template, tags) { return defaultWriter.parse(template, tags); }; mustache.render = function render (template, view, partials, config) { if (typeof template !== 'string') { throw new TypeError('Invalid template! Template should be a "string" but "' + typeStr(template) + '" was given as the first argument for mustache#render(template, view, partials)'); } return defaultWriter.render(template, view, partials, config); }; mustache.escape = escapeHtml; mustache.Scanner = Scanner; mustache.Context = Context; mustache.Writer = Writer; return mustache;
}());
// --- END: Mustache.js v4.1.0 ---
function parseIconAndColor(iconField) {
    if (!iconField) return { iconClass: '', iconStyle: '' };
    const regex = /^(.*?)\s+(#[\dA-Fa-f]{6,8}|rgb\s*\(.*?\)|rgba\s*\(.*?\))\s*$/;
    const match = iconField.trim().match(regex);
    if (match) {
        return { iconClass: match[1].trim(), iconStyle: `color:${match[2].trim()};` };
    }
    return { iconClass: iconField.trim(), iconStyle: '' };
}

function getFirstImageUrl(htmlContent) {
    if (!htmlContent) return '';
    const match = htmlContent.match(/<img.*?src=["'](.*?)["']/);
    return match ? match[1] : '';
}

const theme = "xyrj";
// 这里如果是根目录则留空或者写你的域名，具体取决于你的前端静态文件放在哪
const cdn = "https://xybk-91b.pages.dev/themes"; 

let site = {
	"title": "夏雨个人博客",          // 【可改】浏览器标签页上显示的默认标题
	"logo": cdn + "/" + theme + "/files/logo.png", // 【可改】网站 Logo 图片地址。如果你有外链图片，可以换成 "https://xxx.com/logo.png"
	"siteName": "夏雨个人博客",        // 【可改】网站左上角或顶部显示的默认网站名字
	"siteDescription": "分享技术与生活", // 【可改】网站的默认简介（用于搜索引擎收录 SEO 或页面副标题）
	"copyRight": '<p>Copyright @ 2025 <a href="https://github.com/Air-L/cf-pages-blog-template" target="_blank">夏雨日记 </a> - 基于  Cloudflare  构建</p>', // 【可改】网页最底部的版权声明（已修复单双引号冲突）
	"siteKeywords": "博客,生活,技术",   // 【可改】网站的默认关键词，给搜索引擎抓取用的，词之间用半角逗号隔开
	"theme_github_path": cdn + "/", // 【建议保留默认】前端主题静态文件的路径根目录
	"codeBeforHead": "", // 【可留空】你想插入到网页 <head> 标签前的代码（比如 Google Analytics 统计代码）
	"codeBeforBody": "", // 【可留空】你想插入到网页 <body> 结束前的代码（比如鼠标点击特效脚本）
	"commentCode": "",   // 【可留空】第三方评论系统代码（如果你不用系统自带的，想外挂 Twikoo/Waline 等可填这）
	"widgetOther": "",   // 【可留空】侧边栏自定义小组件的 HTML 代码
};

// 核心函数：通过 KV 缓存极速读取 D1 配置
async function getConfigs(env) {
    // 1. 尝试命中 KV 缓存
    let cached = await env.kv.get("cache:config", { type: "json" });
    if (cached) return cached;

    // 2. 缓存未命中，查 D1 数据库
    const { results } = await env.db.prepare("SELECT key, value FROM config").all();
    let configs = {};
    for (let row of results) {
        configs[row.key] = row.value;
    }
    
    // 3. 写入 KV 缓存
    await env.kv.put("cache:config", JSON.stringify(configs));
    return configs;
}

export default {
	async fetch(request, env, ctx) {
		return handleRequest({ request, env, ctx });
	}
};

async function handleRequest({ request, env, ctx }) {
	const url = new URL(request.url);
	const { pathname } = url;

	try {
        // --- 前台路由 ---
		if (pathname === "/" || pathname.startsWith("/page/")) {
			return await renderHTML(request, await getIndexData(request, env), theme + "/index.html", 200, env, ctx);
		}
		else if (pathname.startsWith("/article/")) {
			const parts = pathname.split('/');
            const id = parts[2];
			return await renderHTML(request, await getArticleData(request, id, env, ctx), theme + "/article.html", 200, env, ctx);
		}
		else if (pathname.startsWith("/category/") || pathname.startsWith("/tags/")) {
            const isCat = pathname.startsWith("/category/");
			let key = isCat ? pathname.substring(10, pathname.lastIndexOf('/')) : pathname.substring(6, pathname.lastIndexOf('/'));
			let page = 1;
			if (pathname.includes("/page/")) {
				key = pathname.substring(isCat ? 10 : 6, pathname.lastIndexOf('/page/'));
				page = parseInt(pathname.substring(pathname.lastIndexOf('/page/') + 6, pathname.lastIndexOf('/'))) || 1;
			}
			return await renderHTML(request, await getCategoryOrTagsData(request, isCat ? "category" : "tags", key, page, env), theme + "/index.html", 200, env, ctx);
		}
		else if (pathname.startsWith("/search/")) {
			let key = pathname.substring(8, pathname.lastIndexOf('/'));
			let page = 1;
			if (pathname.substring(8, pathname.length).includes("page/")) {
				key = pathname.substring(8, pathname.lastIndexOf('/page/'));
				page = parseInt(pathname.substring(pathname.lastIndexOf('/page/') + 6, pathname.lastIndexOf('/'))) || 1;
			}
			return await renderHTML(request, await getSearchData(request, key, page, env), theme + "/index.html", 200, env, ctx);
		}
		else if (pathname === "/fontawesome.html" || pathname === "/fontawesome" || pathname === "/fontawesome/") {
			let data = { "title": "Font Awesome 图标" };
            const configs = await getConfigs(env);
			let categories = JSON.parse(configs["WidgetCategory"] || "[]");
			data["widgetCategoryList"] = categories.map(cat => ({ ...cat, ...parseIconAndColor(cat.icon) }));
			data["widgetLinkList"] = JSON.parse(configs["WidgetLink"] || "[]");
            // 获取热门文章 (D1 直查)
			const { results: recent } = await env.db.prepare("SELECT id, title, link, createDate, hasPassword, isPinned, firstImageUrl FROM articles WHERE isHidden = 0 ORDER BY isPinned DESC, createDate DESC LIMIT 5").all();
			data["widgetRecentlyList"] = recent.map(item => ({ ...item, url: `/article/${item.id}/${item.link}`, isPasswordProtected: !!item.hasPassword, createDate10: item.createDate.substring(0, 10) }));
			return await renderHTML(request, data, theme + "/fontawesome.html", 200, env, ctx);
		}
		else if (pathname === "/2fa.html" || pathname === "/2fa" || pathname === "/2fa/") {
			let data = { "title": "两步验证" };
            const configs = await getConfigs(env);
			data["widgetLinkList"] = JSON.parse(configs["WidgetLink"] || "[]");
			return await renderHTML(request, data, theme + "/2fa.html", 200, env, ctx);
		}
        // --- 后台 API 与路由 ---
		else if (pathname.startsWith("/admin")) {
			if (pathname === "/admin" || pathname === "/admin/" || pathname.endsWith("/admin/index.html")) {
				let data = {};
                const configs = await getConfigs(env);
				data["title"] = configs["siteName"] || '';
                data["widgetCategoryList"] = configs["WidgetCategory"] || '[]';
                data["widgetMenuList"] = configs["WidgetMenu"] || '[]';
                data["widgetLinkList"] = configs["WidgetLink"] || '[]';
                data["footer_links"] = configs["footer_links"] || '[]';
                data["site_footer_copyright"] = configs["site_footer_copyright"] || '';
                data["site_description"] = configs["site_description"] || '';
                data["site_keywords"] = configs["site_keywords"] || '';
				data["admin_username"] = configs["admin_username"] || '';
                data["admin_password"] = configs["admin_password"] || '';
				data["favicon"] = configs["favicon"] || '';
                data["siteName"] = configs["siteName"] || '';
                data["logo"] = configs["logo"] || '';
				data["mobile_header_bg"] = configs["mobile_header_bg"] || '';
                data["tg_bot_token"] = configs["tg_bot_token"] || ''; data["tg_chat_id"] = configs["tg_chat_id"] || '';
				data["xytk_api_url"] = configs["xytk_api_url"] || ''; data["xytk_api_key"] = configs["xytk_api_key"] || '';
                data["active_storage_node"] = configs["active_storage_node"] || 'r2';
                if (configs["showSiteNameInHeader"] === 'false') {
                    data["showSiteNameInHeader_false"] = true;
                } else {
                    data["showSiteNameInHeader_true"] = true;
                }
				return await renderHTML(request, data, theme + "/admin/index.html", 200, env, ctx);
			}
			else if (pathname === "/admin/login" && request.method === "POST") {
				try {
					const { username, password } = await request.json();
                    const configs = await getConfigs(env);
					if (username === configs["admin_username"] && password === configs["admin_password"]) {
						return new Response(JSON.stringify({ status: "ok" }), { status: 200, headers: { 'Content-Type': 'application/json' }});
					} else {
						return new Response(JSON.stringify({ status: "error", message: "Invalid credentials" }), { status: 401, headers: { 'Content-Type': 'application/json' }});
					}
				} catch (e) {
					return new Response(JSON.stringify({ status: "error", message: "Bad request" }), { status: 400, headers: { 'Content-Type': 'application/json' }});
				}
			}
			else if (await checkPass(request, env)) {
				if (pathname.startsWith("/admin/saveAddNew/")) {
					let jsonA = await request.json();
					let article = { 'category[]': [] };
                    jsonA.forEach(item => {
                        if (item.name === 'category[]') article[item.name].push(item.value);
                        else article[item.name] = item.value;
                    });
					const maxIdRow = await env.db.prepare("SELECT id FROM articles ORDER BY CAST(id AS INTEGER) DESC LIMIT 1").first();
					let nextIdNum = 1;
					if (maxIdRow && maxIdRow.id) {
						const parsed = parseInt(maxIdRow.id, 10);
						if (!isNaN(parsed) && parsed > 0) nextIdNum = parsed + 1;
					}
					const id = String(nextIdNum).padStart(3, '0');
                    const contentText = (article.content || "").replace(/<[^>]+>/g, "").substring(0, 180);
                    const firstImg = article.img || getFirstImageUrl(article.content) || `${cdn}/${theme}/files/noimage.jpg`;

                    // D1 写入
                    await env.db.prepare(`
                        INSERT INTO articles (id, title, link, createDate, category, tags, content, contentText, firstImageUrl, isPinned, hasPassword, password, views, isHidden, allowComments, changefreq, priority)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        id, article.title, article.link, article.createDate, JSON.stringify(article['category[]']), article.tags,
                        article.content, contentText, firstImg, article.isPinned === 'true'?1:0, !!article.password?1:0,
                        article.password || '', parseInt(article.views || 0), article.isHidden === 'true'?1:0,
                        article.allowComments === 'true'?1:0, article.changefreq, article.priority
                    ).run();

					return new Response(JSON.stringify({ "id": id, "msg": "OK" }), { status: 200, headers: { 'Content-Type': 'application/json' }});
				}
				else if (pathname.startsWith("/admin/saveEdit/")) {
					let jsonA = await request.json();
					let article = { 'category[]': [] };
                    jsonA.forEach(item => {
                        if (item.name === 'category[]') article[item.name].push(item.value);
                        else article[item.name] = item.value;
                    });
                    const contentText = (article.content || "").replace(/<[^>]+>/g, "").substring(0, 180);
                    const firstImg = article.img || getFirstImageUrl(article.content) || `${cdn}/${theme}/files/noimage.jpg`;

                    await env.db.prepare(`
                        UPDATE articles SET title=?, link=?, createDate=?, category=?, tags=?, content=?, contentText=?, firstImageUrl=?, isPinned=?, hasPassword=?, password=?, views=?, isHidden=?, allowComments=?, changefreq=?, priority=?
                        WHERE id=?
                    `).bind(
                        article.title, article.link, article.createDate, JSON.stringify(article['category[]']), article.tags,
                        article.content, contentText, firstImg, article.isPinned === 'true'?1:0, !!article.password?1:0,
                        article.password || '', parseInt(article.views || 0), article.isHidden === 'true'?1:0,
                        article.allowComments === 'true'?1:0, article.changefreq, article.priority, article.id
                    ).run();

					return new Response(JSON.stringify({ "id": article.id, "msg": "OK" }), { status: 200, headers: { 'Content-Type': 'application/json' }});
				}
				else if (pathname.startsWith("/admin/get/")) {
					const id = pathname.split('/')[3]; 
					const row = await env.db.prepare("SELECT * FROM articles WHERE id = ?").bind(id).first();
					if (row) {
                        row.createDate10 = row.createDate.substring(0, 10);
                        row['category[]'] = JSON.parse(row.category || '[]');
                        row.isPinned = !!row.isPinned;
                        row.isHidden = !!row.isHidden;
                        row.allowComments = !!row.allowComments;
                        row.hasPassword = !!row.hasPassword;
						return new Response(JSON.stringify(row), { status: 200, headers: { 'Content-Type': 'application/json' }});
					} else {
						return new Response(JSON.stringify({ msg: "Not found" }), { status: 404, headers: { 'Content-Type': 'application/json' }});
					}
				}
				else if (pathname.startsWith("/admin/getList/")) {
					const url = new URL(request.url);
					let page = parseInt(url.searchParams.get('page') || '1');
					let pageSize = parseInt(url.searchParams.get('size') || '10'); 

					const countRow = await env.db.prepare("SELECT COUNT(*) as c FROM articles").first();
                    const { results } = await env.db.prepare("SELECT id, title, createDate, category, isPinned, isHidden, hasPassword FROM articles ORDER BY isPinned DESC, createDate DESC LIMIT ? OFFSET ?").bind(pageSize, (page - 1) * pageSize).all();
					
                    const formatted = results.map(row => ({
                        ...row,
                        'category[]': JSON.parse(row.category || '[]'),
                        isPinned: !!row.isPinned,
                        isHidden: !!row.isHidden,
                        hasPassword: !!row.hasPassword
                    }));

					return new Response(JSON.stringify({ data: formatted, totalItems: countRow.c }), { status: 200, headers: { 'Content-Type': 'application/json' }});
				}
				else if (pathname.startsWith("/admin/delete/")) {
    				const id = pathname.split('/')[3];
                    await env.db.prepare("DELETE FROM articles WHERE id = ?").bind(id).run();
					return new Response(JSON.stringify({ "msg": "OK" }), { status: 200, headers: { 'Content-Type': 'application/json' }});
				}
				else if (pathname.startsWith("/admin/api/search/articles")) {
					const url = new URL(request.url);
					const query = (url.searchParams.get('q') || '').toLowerCase();
					if (!query) return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' }});
                    
                    // D1 SQL 模糊查询
                    const { results } = await env.db.prepare("SELECT id, title, createDate, category, isPinned, isHidden, hasPassword FROM articles WHERE LOWER(title) LIKE ? OR LOWER(id) LIKE ? OR LOWER(category) LIKE ? ORDER BY createDate DESC LIMIT 50").bind(`%${query}%`, `%${query}%`, `%${query}%`).all();
					
                    const formatted = results.map(row => ({
                        ...row, 'category[]': JSON.parse(row.category || '[]'), isPinned: !!row.isPinned, isHidden: !!row.isHidden, hasPassword: !!row.hasPassword
                    }));
					return new Response(JSON.stringify(formatted), { status: 200, headers: { 'Content-Type': 'application/json' }});
				}
				else if (pathname.startsWith("/admin/saveConfig/")) {
					let receivedData = await request.json();
                    let stmt = env.db.prepare("INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
                    let batch = receivedData.map(item => stmt.bind(item.name, item.value));
                    if (batch.length > 0) await env.db.batch(batch);
                    
                    // 清理 KV 缓存，让下一次请求立刻读取最新 D1 数据库
                    await env.kv.delete("cache:config");
					return new Response(JSON.stringify({ "msg": "OK" }), { status: 200, headers: { 'Content-Type': 'application/json' }});
				}
				else if (pathname.startsWith("/admin/publish/")) {
					const cache = caches.default;
        			await cache.delete(new Request(new URL("/", request.url).toString()));
					return new Response(JSON.stringify({ "msg": "OK" }), { status: 200, headers: { 'Content-Type': 'application/json' }});
				}
				else if (pathname === '/admin/api/comments_full' && request.method === 'GET') {
                    const { results } = await env.db.prepare("SELECT * FROM comments ORDER BY timestamp DESC").all();
                    const comments = results.map(r => ({ ...r, contact: JSON.parse(r.contact || '{}') }));
					return new Response(JSON.stringify(comments), { headers: { 'Content-Type': 'application/json' } });
				}
				else if (pathname === '/admin/api/carousel/setAll' && request.method === 'POST') {
					try {
						const newArray = await request.json();
                        // D1 事务：先清空，再重新插入排序好的
                        await env.db.prepare("DELETE FROM carousel").run();
                        let stmt = env.db.prepare("INSERT INTO carousel (id, imageUrl, linkUrl, sortOrder) VALUES (?, ?, ?, ?)");
                        let batch = newArray.map((item, index) => stmt.bind(item.id, item.imageUrl, item.linkUrl, index));
                        if(batch.length > 0) await env.db.batch(batch);
						return new Response(JSON.stringify({ msg: "OK" }), { status: 200 });
					  } catch (e) {
						return new Response(JSON.stringify({ msg: e.message }), { status: 500 });
					  }
				}
				// --- START: 优化后的图片管理 API (全格式支持 & 异常保护) ---
				else if (pathname === '/admin/api/images' && request.method === 'GET') {
					try {
						// 配合前端分页功能，移除 LIMIT 100 限制，获取全部图片数据
						const { results } = await env.db.prepare("SELECT * FROM images ORDER BY upload_date DESC").all();
						return new Response(JSON.stringify(results || []), { status: 200, headers: { 'Content-Type': 'application/json' } });
					} catch (e) {
						return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
					}
				}
				else if (pathname.startsWith('/admin/api/images/') && request.method === 'DELETE') {
					const imageId = pathname.split('/').pop();
					try {
						// 1. 先查出该图片的信息，获取它的 URL 和 存储节点类型
						const imgRecord = await env.db.prepare("SELECT * FROM images WHERE id = ?").bind(imageId).first();
						
						if (imgRecord) {
							const configs = await getConfigs(env);
							
							// 2. 如果是外部 API，则发起请求删除远端图片
							if (imgRecord.storage_node === 'xytk') {
								const apiKey = configs["xytk_api_key"];
								
								// 假设你的图床删除 API 和 上传 API 在同一目录下，且后缀是 delete
								// 如果你的图床有特定的删除 API 地址，请修改下面的 deleteApiUrl
								const deleteApiUrl = configs["xytk_api_url"].replace('upload', 'delete'); 
								
								try {
									await fetch(deleteApiUrl, {
										method: 'POST', // 部分图床要求是 DELETE 方法，请根据图床文档调整
										headers: {
											'Authorization': 'Bearer ' + apiKey,
											'Content-Type': 'application/json'
										},
										body: JSON.stringify({ url: imgRecord.url }) // 传递要删除的图片URL
									});
								} catch (err) {
									console.error("同步删除外部图床图片失败:", err);
									// 远端删除失败不阻断，继续清理本地数据
								}
							}
							
							// (顺便补全) 如果是 R2 存储，真实删除 R2 桶里的文件
							else if (imgRecord.storage_node === 'r2' && env.r2) {
								const fileName = imgRecord.url.replace('/image/', '');
								await env.r2.delete(fileName);
							}
						}

						// 3. 最后删除本地 D1 数据库记录
						await env.db.prepare("DELETE FROM images WHERE id = ?").bind(imageId).run();
						return new Response(JSON.stringify({ msg: "OK" }), { status: 200 });
					} catch (e) {
						return new Response(JSON.stringify({ msg: e.message }), { status: 500 });
					}
				}
				else if (pathname.startsWith('/admin/api/images/') && request.method === 'PUT') {
					const imageId = pathname.split('/').pop();
					try {
						const { name } = await request.json();
						if (!name) return new Response("图片名称不能为空", { status: 400 });
						
						// 检查是否与现有其他图片重名
						const existImg = await env.db.prepare("SELECT id FROM images WHERE name = ? AND id != ?").bind(name, imageId).first();
						if (existImg) return new Response("已存在同名图片，请更换名称！", { status: 400 });

						await env.db.prepare("UPDATE images SET name = ? WHERE id = ?").bind(name, imageId).run();
						return new Response(JSON.stringify({ msg: "OK" }), { status: 200 });
					} catch (e) {
						return new Response(e.message, { status: 500 });
					}
				}
				else if (pathname === '/admin/api/upload_image' && request.method === 'POST') {
					try {
						const formData = await request.formData();
						const file = formData.get('file');
						if (!file) return new Response("没有接收到文件", { status: 400 });

						// --- 格式校验：支持 image/* 以及特殊的 ico, svg ---
						const isImage = file.type.startsWith('image/') || 
										/\.(ico|svg|webp|avif)$/i.test(file.name);
						if (!isImage) return new Response("只允许上传图片格式 (包含 ico, svg, webp 等)", { status: 400 });

						const configs = await getConfigs(env);
						const activeNode = configs["active_storage_node"] || 'tg';
						const fileExt = file.name.split('.').pop().toLowerCase();
						const fileArrayBuffer = await file.arrayBuffer();
						const existImg = await env.db.prepare("SELECT id FROM images WHERE name = ?").bind(file.name).first();
						if (existImg) {
							return new Response("有相同图片名，请重新输入名称！", { status: 400 });
						}
						const fileName = file.name;
						let finalUrl = '';

						if (activeNode === 'tg') {
							const tgToken = configs["tg_bot_token"];
							const tgChatId = configs["tg_chat_id"];
							if (!tgToken || !tgChatId) return new Response("TG配置缺失", { status: 400 });
							const tgFormData = new FormData();
							tgFormData.append('chat_id', tgChatId);
							tgFormData.append('document', new Blob([fileArrayBuffer]), fileName);
							const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendDocument`, { method: 'POST', body: tgFormData });
							const tgData = await tgRes.json();
							if (!tgData.ok) return new Response("TG上传失败", { status: 500 });
							finalUrl = `/image/${tgData.result.document.file_id}.${fileExt}`;
							} else if (activeNode === 'xytk') {
							const apiUrl = configs["xytk_api_url"];
							const apiKey = configs["xytk_api_key"];
							if (!apiUrl || !apiKey) return new Response("外部API配置缺失", { status: 400 });
							const apiFormData = new FormData();
							apiFormData.append('file', new Blob([fileArrayBuffer], { type: file.type }), fileName);
							const apiRes = await fetch(apiUrl, { method: 'POST', headers: { 'Authorization': 'Bearer ' + apiKey }, body: apiFormData });
							const apiData = await apiRes.json();
							if (!apiRes.ok || !apiData.success) return new Response("外部图床上传失败", { status: 500 });
							finalUrl = apiData.url;
						} else if (activeNode === 'r2' && env.r2) {
							await env.r2.put(fileName, fileArrayBuffer, { httpMetadata: { contentType: file.type } });
							finalUrl = `/image/${fileName}`;
						}

						const imgId = crypto.randomUUID();
						const uploadDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
						await env.db.prepare("INSERT INTO images (id, name, url, storage_node, upload_date) VALUES (?, ?, ?, ?, ?)")
							.bind(imgId, file.name, finalUrl, activeNode, uploadDate).run();

						return new Response(JSON.stringify({ msg: "OK", url: finalUrl }), { status: 200 });
					} catch (e) { return new Response(e.stack, { status: 500 }); }
				}
				// --- END: 优化后的图片管理 API ---
				else if (pathname === "/admin/export/" || pathname === "/admin/export") {
					try {
						const urlParams = new URL(request.url).searchParams;
						let backupData = {};
						
						// 1. 导出网站设置 (包含 config, comments, carousel)
						if (urlParams.get('settings') === 'true') {
							const { results: config } = await env.db.prepare("SELECT * FROM config").all();
							const { results: comments } = await env.db.prepare("SELECT * FROM comments").all();
							const { results: carousel } = await env.db.prepare("SELECT * FROM carousel").all();
							backupData.config = config;
							backupData.comments = comments;
							backupData.carousel = carousel;
						}
						
						// 2. 导出我的文章
						if (urlParams.get('articles') === 'true') {
							const { results: articles } = await env.db.prepare("SELECT * FROM articles").all();
							backupData.articles = articles;
						}
						
						// 3. 导出博客图片
						if (urlParams.get('images') === 'true') {
							const { results: images } = await env.db.prepare("SELECT * FROM images").all();
							backupData.images = images;
						}

						// 返回 JSON 文件下载
						return new Response(JSON.stringify(backupData), {
							status: 200,
							headers: {
								'Content-Type': 'application/json;charset=UTF-8',
								'Content-Disposition': `attachment; filename="xybk_backup_${new Date().toISOString().slice(0, 10)}.json"`
							}
						});
					} catch (e) {
						return new Response(JSON.stringify({ msg: e.message }), { status: 500 });
					}
				}
				else if (pathname === "/admin/import/" && request.method === "POST") {
					try {
						let jsonA = await request.json();
						let importStr = "";
						jsonA.forEach(item => { if (item.name === 'importJson') importStr = item.value; });
						let backup = JSON.parse(importStr);

						// 1. 恢复文章数据
						if (backup.articles && backup.articles.length > 0) {
							await env.db.prepare("DELETE FROM articles").run();
							let stmt = env.db.prepare("INSERT INTO articles (id, title, link, createDate, category, tags, content, contentText, firstImageUrl, isPinned, hasPassword, password, views, isHidden, allowComments, changefreq, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
							let batch = backup.articles.map(a => stmt.bind(a.id, a.title, a.link, a.createDate, a.category, a.tags, a.content, a.contentText, a.firstImageUrl, a.isPinned, a.hasPassword, a.password, a.views, a.isHidden, a.allowComments, a.changefreq, a.priority));
							if (batch.length > 0) await env.db.batch(batch);
						}

						// 2. 恢复配置数据
						if (backup.config && backup.config.length > 0) {
							await env.db.prepare("DELETE FROM config").run();
							let stmtConfig = env.db.prepare("INSERT INTO config (key, value) VALUES (?, ?)");
							let batchConfig = backup.config.map(c => stmtConfig.bind(c.key, c.value));
							if (batchConfig.length > 0) await env.db.batch(batchConfig);
							await env.kv.delete("cache:config");
						}

						// 3. 恢复评论数据
						if (backup.comments && backup.comments.length > 0) {
							await env.db.prepare("DELETE FROM comments").run();
							let stmt = env.db.prepare("INSERT INTO comments (id, articleSlug, content, contact, timestamp) VALUES (?, ?, ?, ?, ?)");
							let batch = backup.comments.map(c => stmt.bind(c.id, c.articleSlug, c.content, c.contact, c.timestamp));
							if (batch.length > 0) await env.db.batch(batch);
						}

						// 4. 恢复轮播图数据
						if (backup.carousel && backup.carousel.length > 0) {
							await env.db.prepare("DELETE FROM carousel").run();
							let stmt = env.db.prepare("INSERT INTO carousel (id, imageUrl, linkUrl, sortOrder) VALUES (?, ?, ?, ?)");
							let batch = backup.carousel.map(c => stmt.bind(c.id, c.imageUrl, c.linkUrl, c.sortOrder));
							if (batch.length > 0) await env.db.batch(batch);
						}

						// 5. 恢复图片管理数据
						if (backup.images && backup.images.length > 0) {
							await env.db.prepare("DELETE FROM images").run();
							let stmt = env.db.prepare("INSERT INTO images (id, name, url, storage_node, upload_date) VALUES (?, ?, ?, ?, ?)");
							let batch = backup.images.map(c => stmt.bind(c.id, c.name, c.url, c.storage_node, c.upload_date));
							if (batch.length > 0) await env.db.batch(batch);
						}

						return new Response(JSON.stringify({ "msg": "OK" }), { status: 200, headers: { 'Content-Type': 'application/json' }});
					} catch (e) {
						return new Response(JSON.stringify({ "msg": "导入失败: " + e.message }), { status: 500, headers: { 'Content-Type': 'application/json' }});
					}
				}
			}
			else {
				return new Response("Unauthorized", { status: 401 });
			}
		}
		else if (pathname.startsWith("/sitemap.xml")) {
            const { results } = await env.db.prepare("SELECT id, link, createDate, changefreq, priority FROM articles WHERE isHidden = 0").all();
			let xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
			for (const item of results) {
				xml += `<url>
          <loc>${url.origin}/article/${item.id}/${item.link}</loc>
          <lastmod>${new Date(item.createDate).toISOString()}</lastmod>
          <changefreq>${item.changefreq || 'daily'}</changefreq>
          <priority>${item.priority || '0.5'}</priority>
        </url>`;
		    }
			xml += `</urlset>`;
			return new Response(xml, { status: 200, headers: { 'Content-Type': 'application/xml;charset=UTF-8' }});
		}
		else if (pathname.startsWith("/atom.xml") || pathname.startsWith("/rss.xml")) {
			// 获取网站配置信息
			const configs = await getConfigs(env);
			const siteUrl = url.origin;
			const siteName = configs.siteName || "我的博客";
			const siteDescription = configs.site_description || "";
			
			// 从 D1 数据库查询最新公开的 20 篇文章
			const { results } = await env.db.prepare("SELECT id, title, link, createDate, contentText FROM articles WHERE isHidden = 0 AND hasPassword = 0 ORDER BY createDate DESC LIMIT 20").all();
			// 获取最后更新时间
			let lastBuildDate = new Date().toUTCString();
			if (results.length > 0 && results[0].createDate) {
				lastBuildDate = new Date(results[0].createDate).toUTCString();
			}

			// 拼接 RSS 2.0 标准 XML 头部
			let xml = `<?xml version="1.0" encoding="UTF-8"?>
				<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
				<channel>
					<title><![CDATA[${siteName}]]></title>
					<link>${siteUrl}</link>
					<description><![CDATA[${siteDescription}]]></description>
					<atom:link href="${siteUrl}${pathname}" rel="self" type="application/rss+xml" />
					<lastBuildDate>${lastBuildDate}</lastBuildDate>`;
				
							// 循环拼接每一篇文章
							for (const item of results) {
								const itemUrl = `${siteUrl}/article/${item.id}/${item.link}`;
								const pubDate = new Date(item.createDate).toUTCString();
								xml += `
					<item>
						<title><![CDATA[${item.title}]]></title>
						<link>${itemUrl}</link>
						<guid>${itemUrl}</guid>
						<pubDate>${pubDate}</pubDate>
						<description><![CDATA[${item.contentText || ''}]]></description>
					</item>`;
							}
							
							// 拼接结尾
							xml += `
				</channel>
				</rss>`;
							return new Response(xml, { status: 200, headers: { 'Content-Type': 'application/xml;charset=UTF-8' }});
		}
        // --- API 接口路由 ---
		else if (pathname.startsWith('/api/comments/') && request.method === 'GET') {
			const articleSlug = pathname.split('/')[3]; 
            const { results } = await env.db.prepare("SELECT * FROM comments WHERE articleSlug = ? ORDER BY timestamp ASC").bind(articleSlug).all();
			const safeComments = results.map(comment => {
				let processed = { ...comment, contact: JSON.parse(comment.contact || '{}') };
				if (processed.contact && processed.contact.value && processed.contact.value.length > 2) {
					processed.contact.value = processed.contact.value.substring(0, 2) + '*'.repeat(processed.contact.value.length - 2);
				}
				return processed;
			});
			return new Response(JSON.stringify(safeComments), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}
		else if (pathname.startsWith('/api/comments/') && request.method === 'POST') {
			const articleSlug = pathname.split('/')[3];
			let newComment = await request.json();
            const cid = crypto.randomUUID();
            await env.db.prepare("INSERT INTO comments (id, articleSlug, content, contact, timestamp) VALUES (?, ?, ?, ?, ?)")
                .bind(cid, articleSlug, newComment.content, JSON.stringify(newComment.contact), newComment.timestamp).run();
			return new Response(JSON.stringify(newComment), { status: 201, headers: { 'Content-Type': 'application/json' } });
		}
		else if (pathname.startsWith('/api/comments/') && request.method === 'DELETE') {
			const commentId = pathname.split('/')[4];
            await env.db.prepare("DELETE FROM comments WHERE id = ?").bind(commentId).run();
			return new Response('Comment deleted', { status: 200 });
		}
		else if (pathname === '/api/comments_all' && request.method === 'GET') {
			const { results } = await env.db.prepare("SELECT * FROM comments ORDER BY timestamp DESC LIMIT 50").all();
			const allComments = results.map(c => {
				let processed = { ...c, contact: JSON.parse(c.contact || '{}') };
				if (processed.contact && processed.contact.value && processed.contact.value.length > 2) {
					processed.contact.value = processed.contact.value.substring(0, 2) + '*'.repeat(processed.contact.value.length - 2);
				}
				return processed;
			});
			return new Response(JSON.stringify(allComments), { headers: { 'Content-Type': 'application/json' } });
		}
		else if (pathname === '/api/carousel' && request.method === 'GET') {
			const { results } = await env.db.prepare("SELECT * FROM carousel ORDER BY sortOrder ASC").all();
			return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
		}
		else if (pathname === '/api/carousel' && request.method === 'POST') {
			let newSlide = await request.json();
			newSlide.id = crypto.randomUUID();
            await env.db.prepare("INSERT INTO carousel (id, imageUrl, linkUrl, sortOrder) VALUES (?, ?, ?, 999)").bind(newSlide.id, newSlide.imageUrl, newSlide.linkUrl).run();
			return new Response(JSON.stringify(newSlide), { status: 201, headers: { 'Content-Type': 'application/json' } });
		}
		else if (pathname.startsWith('/api/carousel/') && request.method === 'DELETE') {
			const slideId = pathname.split('/').pop();
            await env.db.prepare("DELETE FROM carousel WHERE id = ?").bind(slideId).run();
			return new Response('Carousel slide deleted', { status: 200 });
		}
		else if (pathname.startsWith("/image/")) {
			const fileName = pathname.replace('/image/', '');
			const configs = await getConfigs(env);
			const activeNode = configs["active_storage_node"] || 'r2';
			const cacheKey = new Request(url.toString(), request);
			const cache = caches.default;
			
			let cachedResponse = await cache.match(cacheKey);
			if (cachedResponse) return cachedResponse;

			let imgResponse;
			if (activeNode === 'r2') {
                // 注意：请确保在 CF 控制台为该 Worker 绑定了名为 r2 的变量
				if (!env.r2) return new Response("R2 未绑定", { status: 500 });
				const object = await env.r2.get(fileName);
				if (!object) return new Response("图片不存在", { status: 404 });
				const headers = new Headers();
				object.writeHttpMetadata(headers);
				headers.set('etag', object.httpEtag);
				headers.set('Cache-Control', 'public, max-age=31536000');
				imgResponse = new Response(object.body, { headers });
			} else if (activeNode === 'tg') {
				const fileId = fileName.split('.')[0]; 
				const tgToken = configs["tg_bot_token"];
				const getFileUrl = `https://api.telegram.org/bot${tgToken}/getFile?file_id=${fileId}`;
				const fileData = await (await fetch(getFileUrl)).json();
				if (fileData.ok) {
					const imgRes = await fetch(`https://api.telegram.org/file/bot${tgToken}/${fileData.result.file_path}`);
					const headers = new Headers(imgRes.headers);
					headers.set('Cache-Control', 'public, max-age=31536000');
					imgResponse = new Response(imgRes.body, { headers });
				} else {
					return new Response("TG 图片不存在", { status: 404 });
				}
			} else {
				return new Response("当前节点不支持代理", { status: 400 });
			}

			if (imgResponse) {
				ctx.waitUntil(cache.put(cacheKey, imgResponse.clone()));
				return imgResponse;
			}
		}
		else {
			return await getStaticFile(request, env, ctx);
		}
	} catch (e) {
		return new Response(e.stack, { status: 500 });
	}
}

async function checkPass(request, env) {
	const cookie = request.headers.get("cookie");
	if (!cookie) return false;
	const cookies = cookie.split(';').reduce((acc, c) => {
		const [key, v] = c.trim().split('=');
		if (key) acc[key] = decodeURIComponent(v);
		return acc;
	}, {});
    
    // 直接从 KV 缓存中获取账号密码验证（速度最快）
    const configs = await getConfigs(env);
	return cookies["username"] === configs["admin_username"] && cookies["password"] === configs["admin_password"];
}

async function getStaticFile(request, env, ctx) {
	const url = new URL(request.url);
	const cache = caches.default;
	let response = await cache.match(request);
	if (!response) {
		const pagesUrl = url.toString().replace(url.origin, cdn);
		response = await fetch(pagesUrl);
		if (response.ok) ctx.waitUntil(cache.put(request, response.clone()));
	}
	return response;
}

async function renderHTML(request, data, path, status, env) {
	const body = await render(data, path, env);
	return new Response(body, { status: status, headers: { "Content-Type": "text/html;charset=UTF-8" }});
}

async function render(data, template_path, env) {
    const templateUrl = cdn + "/" + template_path;
	let templateResponse = await fetch(templateUrl);
	let template = await templateResponse.text();
    
    // 统一通过高并发 KV 缓存获取全部设置
    const configs = await getConfigs(env);
    site.logo = configs.logo || (site.theme_github_path + "xyrj/files/logo.png");
    site.siteName = configs.siteName || "";
    site.theme_github_path = configs.theme_github_path || site.theme_github_path;
	site.mobile_header_bg = configs.mobile_header_bg || (site.theme_github_path + "xyrj/files/mobile-header.webp");
	site.favicon = configs.favicon || "";
    site.siteDescription = configs.site_description || "";
    site.siteKeywords = configs.site_keywords || "";
    site.showSiteNameInHeader = configs.showSiteNameInHeader === 'true';
	site.marqueeContent = configs.marqueeContent || "";
	site.showMarqueeOnIndex = configs.showMarqueeOnIndex === 'true';
    site.showMarqueeOnArticle = configs.showMarqueeOnArticle === 'true';
	site.marqueeSpeed = configs.marqueeSpeed || '15s';

    try {
        let widgetMenuList = JSON.parse(configs.WidgetMenu || "[]");
        function processMenuItems(items) {
            if (!items || !Array.isArray(items)) return;
            items.forEach(item => {
                const iconData = parseIconAndColor(item.icon);
                item.iconClass = iconData.iconClass; 
                item.iconStyle = iconData.iconStyle;  
                if (item.children && Array.isArray(item.children) && item.children.length > 0) {
                    item.hasChildren = true;
                    processMenuItems(item.children);
                } else {
                    item.hasChildren = false;
                }
            });
        }
        processMenuItems(widgetMenuList);
        site.widgetMenuList = widgetMenuList;
    } catch (e) { site.widgetMenuList = []; }
    
	let renderData = { ...data, OPT: site };

    if (!template_path.includes('admin')) {
        let footer_links_html = '';
        if (configs.footer_links) {
            try {
                const links = JSON.parse(configs.footer_links);
                if (Array.isArray(links)) {
                    links.forEach((link, index) => {
                        const icon_html = link.icon ? `<i class="${link.icon}"></i> ` : '';
                        footer_links_html += `<a href="${link.url}" target="_blank">${icon_html}${link.text}</a>`;
                        if (index < links.length - 1) footer_links_html += '<span class="split" style="margin: 0 3px;">|</span>';
                    });
                }
            } catch (e) {}
        }
        renderData.footer_links = footer_links_html;
        renderData.site_footer_copyright = configs.site_footer_copyright || '';
    }
	return mustache.render(template, renderData);
}

// === 以下为 D1 数据直查函数群 ===

async function getIndexData(request, env) {
	let url = new URL(request.url);
	let page = 1;
	if (url.pathname.startsWith("/page/")) {
		page = parseInt(url.pathname.substring(6, url.pathname.lastIndexOf('/'))) || 1;
	}
	let pageSize = 10;
    
    // D1 SQL：直接获取文章并排好序
    const countRow = await env.db.prepare("SELECT COUNT(*) as c FROM articles WHERE isHidden = 0").first();
    const total_pages = Math.ceil(countRow.c / pageSize);
    const { results } = await env.db.prepare("SELECT id, title, link, createDate, category, contentText, firstImageUrl, isPinned, hasPassword, views FROM articles WHERE isHidden = 0 ORDER BY isPinned DESC, createDate DESC LIMIT ? OFFSET ?").bind(pageSize, (page - 1) * pageSize).all();

	for (const item of results) {
		item.url = `/article/${item.id}/${item.link}`;
		item.createDate10 = item.createDate.substring(0, 10);
        let catArr = JSON.parse(item.category || '[]');
        item['category[]'] = catArr;
        if (catArr.length > 0) item.firstCategory = catArr[0];
		item.isPasswordProtected = !!item.hasPassword; 
        item.isPinned = !!item.isPinned;
	}

    const configs = await getConfigs(env);
	let data = { listTitle: "文章列表", articleList: results, page_html: generatePaginationHTML(page, total_pages, "/") };
	
    let categories = JSON.parse(configs.WidgetCategory || "[]");
    data["widgetCategoryList"] = categories.map(cat => ({ ...cat, ...parseIconAndColor(cat.icon) }));
	data["widgetLinkList"] = JSON.parse(configs.WidgetLink || "[]");
	
    const { results: carousel } = await env.db.prepare("SELECT * FROM carousel ORDER BY sortOrder ASC").all();
    data["carousel_slides"] = carousel;

    // D1 SQL: 侧边栏近期文章
    const { results: recent } = await env.db.prepare("SELECT id, title, link, createDate, hasPassword, isPinned, firstImageUrl FROM articles WHERE isHidden = 0 ORDER BY isPinned DESC, createDate DESC LIMIT 5").all();
	for (const item of recent) {
		item.url = `/article/${item.id}/${item.link}`;
		item.isPasswordProtected = !!item.hasPassword;
	}
	data["widgetRecentlyList"] = recent;
    
    // 获取所有标签
    const { results: tagRows } = await env.db.prepare("SELECT tags FROM articles WHERE isHidden = 0 AND tags IS NOT NULL AND tags != ''").all();
	const allTags = new Set();
    tagRows.forEach(row => { row.tags.split(',').forEach(tag => { if(tag.trim()) allTags.add(tag.trim()); }); });
    data["widgetTagList"] = Array.from(allTags).map(tag => ({ name: tag, url: `/tags/${encodeURIComponent(tag)}/` }));
    
    data["title"] = configs.siteName || 'cf-xyblog';
	return data;
}

async function getArticleData(request, id, env, ctx) {
	id = id !== undefined ? String(id) : "";
	const articleSingle = await env.db.prepare("SELECT * FROM articles WHERE id = ?").bind(id).first();
	if (!articleSingle) return new Response("Article not found", { status: 404 });

    // 异步更新浏览量
    ctx.waitUntil(env.db.prepare("UPDATE articles SET views = views + 1 WHERE id = ?").bind(id).run());
	articleSingle.views = (articleSingle.views || 0) + 1;

    // 密码保护逻辑
    const hasPassword = !!articleSingle.hasPassword;
    let isEncrypted = false;
    if (hasPassword) {
        isEncrypted = true; 
        const cookieHeader = request.headers.get("cookie") || "";
        const cookies = cookieHeader.split(';').reduce((acc, c) => {
            const [key, v] = c.trim().split('=');
            if (key) acc[key.trim()] = decodeURIComponent(v);
            return acc;
        }, {});
        if (cookies[`article_pass_${id}`] === articleSingle.password) isEncrypted = false;
    }
    articleSingle.isEncrypted = isEncrypted;
    if (isEncrypted) articleSingle.content = ""; 

	articleSingle.tags = articleSingle.tags ? articleSingle.tags.split(',').filter(tag => tag.trim() !== '') : [];
	articleSingle.url = `/article/${articleSingle.id}/${articleSingle.link}`;
	const safeDate = articleSingle.createDate !== undefined && articleSingle.createDate !== null ? String(articleSingle.createDate) : "";
	articleSingle.createDate10 = safeDate.length >= 10 ? safeDate.substring(0, 10) : safeDate;
    articleSingle['category[]'] = JSON.parse(articleSingle.category || '[]');

    const configs = await getConfigs(env);
    const allCategories = JSON.parse(configs.WidgetCategory || "[]");
    articleSingle.categories = articleSingle['category[]'].map(catName => allCategories.find(c => c.name === catName) || { name: catName, icon: '' });

	let data = { articleSingle: articleSingle };
	
    // D1 获取上一篇和下一篇
    const prev = await env.db.prepare("SELECT id, title, link, createDate, firstImageUrl FROM articles WHERE isHidden = 0 AND createDate > ? ORDER BY createDate ASC LIMIT 1").bind(safeDate).first();
    const next = await env.db.prepare("SELECT id, title, link, createDate, firstImageUrl FROM articles WHERE isHidden = 0 AND createDate < ? ORDER BY createDate DESC LIMIT 1").bind(safeDate).first();
	
	if (prev) data["articleNewer"] = { ...prev, url: `/article/${prev.id}/${prev.link}`, img: prev.firstImageUrl, createDate10: prev.createDate ? String(prev.createDate).substring(0, 10) : "" };
	if (next) data["articleOlder"] = { ...next, url: `/article/${next.id}/${next.link}`, img: next.firstImageUrl, createDate10: next.createDate ? String(next.createDate).substring(0, 10) : "" };

    const { results: tagRows } = await env.db.prepare("SELECT tags FROM articles WHERE isHidden = 0 AND tags IS NOT NULL AND tags != ''").all();
	const allTags = new Set();
    tagRows.forEach(row => { row.tags.split(',').forEach(tag => { if(tag.trim()) allTags.add(tag.trim()); }); });
    data["widgetTagList"] = Array.from(allTags).map(tag => ({ name: tag, url: `/tags/${encodeURIComponent(tag)}/` }));

	let breadcrumb_html = `<a href="/"><i class="fas fa-home"></i> 主页</a>`;
	if (articleSingle['category[]'].length > 0) breadcrumb_html += ` / <a href="/category/${encodeURIComponent(articleSingle['category[]'][0])}/">${articleSingle['category[]'][0]}</a>`;
	data["articleBreadcrumb"] = breadcrumb_html;
	data["widgetCategoryList"] = allCategories.map(cat => ({ ...cat, ...parseIconAndColor(cat.icon) }));
	data["widgetLinkList"] = JSON.parse(configs.WidgetLink || "[]");
	
    const { results: recent } = await env.db.prepare("SELECT id, title, link, createDate, hasPassword, isPinned, firstImageUrl FROM articles WHERE isHidden = 0 ORDER BY isPinned DESC, createDate DESC LIMIT 5").all();
	data["widgetRecentlyList"] = recent.map(item => ({...item, url: `/article/${item.id}/${item.link}`, isPasswordProtected: !!item.hasPassword, isPinned: !!item.isPinned, createDate10: item.createDate.substring(0, 10) }));
    data["title"] = articleSingle.title;
	return data;
}

async function getCategoryOrTagsData(request, type, key, page, env) {
	const decodedKey = decodeURI(key);
	let pageSize = 10;
    
    // D1 SQL: 强大的条件搜索
    let countQuery = type === "category" ? "SELECT COUNT(*) as c FROM articles WHERE isHidden = 0 AND category LIKE ?" : "SELECT COUNT(*) as c FROM articles WHERE isHidden = 0 AND tags LIKE ?";
    let dataQuery = type === "category" ? "SELECT id, title, link, createDate, category, contentText, firstImageUrl, isPinned, hasPassword, views FROM articles WHERE isHidden = 0 AND category LIKE ? ORDER BY isPinned DESC, createDate DESC LIMIT ? OFFSET ?" : "SELECT id, title, link, createDate, category, contentText, firstImageUrl, isPinned, hasPassword, views FROM articles WHERE isHidden = 0 AND tags LIKE ? ORDER BY isPinned DESC, createDate DESC LIMIT ? OFFSET ?";
    
    const countRow = await env.db.prepare(countQuery).bind(`%${decodedKey}%`).first();
    const total_pages = Math.ceil(countRow.c / pageSize);
    const { results } = await env.db.prepare(dataQuery).bind(`%${decodedKey}%`, pageSize, (page - 1) * pageSize).all();

	for (const item of results) {
		item.url = `/article/${item.id}/${item.link}`;
        item['category[]'] = JSON.parse(item.category || '[]');
        if (item['category[]'].length > 0) item.firstCategory = item['category[]'][0];
		item.isPasswordProtected = !!item.hasPassword; 
        item.isPinned = !!item.isPinned;
        item.createDate10 = item.createDate.substring(0, 10);
	}

    const configs = await getConfigs(env);
	let data = { listTitle: decodedKey, articleList: results, page_html: generatePaginationHTML(page, total_pages, `/${type}/${key}`) };
	let categories = JSON.parse(configs.WidgetCategory || "[]");
	data["widgetCategoryList"] = categories.map(cat => ({ ...cat, ...parseIconAndColor(cat.icon) }));
	data["widgetLinkList"] = JSON.parse(configs.WidgetLink || "[]");
	
    const { results: recent } = await env.db.prepare("SELECT id, title, link, createDate, hasPassword, isPinned, firstImageUrl FROM articles WHERE isHidden = 0 ORDER BY isPinned DESC, createDate DESC LIMIT 5").all();
	data["widgetRecentlyList"] = recent.map(item => ({...item, url: `/article/${item.id}/${item.link}`, isPasswordProtected: !!item.hasPassword, isPinned: !!item.isPinned, createDate10: item.createDate.substring(0, 10) }));

    const { results: tagRows } = await env.db.prepare("SELECT tags FROM articles WHERE isHidden = 0 AND tags IS NOT NULL AND tags != ''").all();
	const allTags = new Set();
    tagRows.forEach(row => { row.tags.split(',').forEach(tag => { if(tag.trim()) allTags.add(tag.trim()); }); });
    data["widgetTagList"] = Array.from(allTags).map(tag => ({ name: tag, url: `/tags/${encodeURIComponent(tag)}/` }));
    
    data["title"] = `${decodedKey} - ${configs.siteName || 'cf-xyblog'}`;
	return data;
}

async function getSearchData(request, key, page, env) {
	const decodedKey = decodeURI(key).toLowerCase();
	let pageSize = 10;
    
    // D1 SQL: 关键词检索标题和内容
    const countRow = await env.db.prepare("SELECT COUNT(*) as c FROM articles WHERE isHidden = 0 AND (LOWER(title) LIKE ? OR LOWER(contentText) LIKE ?)").bind(`%${decodedKey}%`, `%${decodedKey}%`).first();
    const total_pages = Math.ceil(countRow.c / pageSize);
    const { results } = await env.db.prepare("SELECT id, title, link, createDate, category, contentText, firstImageUrl, isPinned, hasPassword, views FROM articles WHERE isHidden = 0 AND (LOWER(title) LIKE ? OR LOWER(contentText) LIKE ?) ORDER BY isPinned DESC, createDate DESC LIMIT ? OFFSET ?").bind(`%${decodedKey}%`, `%${decodedKey}%`, pageSize, (page - 1) * pageSize).all();

	for (const item of results) {
		item.url = `/article/${item.id}/${item.link}`;
        item['category[]'] = JSON.parse(item.category || '[]');
        if (item['category[]'].length > 0) item.firstCategory = item['category[]'][0];
		item.isPasswordProtected = !!item.hasPassword; 
        item.isPinned = !!item.isPinned;
        item.createDate10 = item.createDate.substring(0, 10);
	}

    const configs = await getConfigs(env);
	let data = { listTitle: `搜索: "${decodeURI(key)}"`, articleList: results, page_html: generatePaginationHTML(page, total_pages, `/search/${key}`) };
	let categories = JSON.parse(configs.WidgetCategory || "[]");
	data["widgetCategoryList"] = categories.map(cat => ({ ...cat, ...parseIconAndColor(cat.icon) }));
	data["widgetLinkList"] = JSON.parse(configs.WidgetLink || "[]");
	
    const { results: recent } = await env.db.prepare("SELECT id, title, link, createDate, hasPassword, isPinned, firstImageUrl FROM articles WHERE isHidden = 0 ORDER BY isPinned DESC, createDate DESC LIMIT 5").all();
	data["widgetRecentlyList"] = recent.map(item => ({...item, url: `/article/${item.id}/${item.link}`, isPasswordProtected: !!item.hasPassword, isPinned: !!item.isPinned, createDate10: item.createDate.substring(0, 10) }));

    const { results: tagRows } = await env.db.prepare("SELECT tags FROM articles WHERE isHidden = 0 AND tags IS NOT NULL AND tags != ''").all();
	const allTags = new Set();
    tagRows.forEach(row => { row.tags.split(',').forEach(tag => { if(tag.trim()) allTags.add(tag.trim()); }); });
    data["widgetTagList"] = Array.from(allTags).map(tag => ({ name: tag, url: `/tags/${encodeURIComponent(tag)}/` }));
    
    data["title"] = `搜索: "${decodeURI(key)}" - ${configs.siteName || 'cf-xyblog'}`;
	return data;
}

function generatePaginationHTML(page, total_pages, page_base_url) {
	let page_html = "";
	if (total_pages > 1) {
	  let page_base = page_base_url === "/" ? "" : page_base_url; 
	  if (page_base.endsWith('/')) page_base = page_base.slice(0, -1);
  
	  let first_page_url = page_base_url === "/" ? "/" : page_base + "/";
	  let last_page_url = `${page_base}/page/${total_pages}/`;
	  let prev_page = Math.max(1, page - 1);
	  let prev_page_url = prev_page === 1 ? first_page_url : `${page_base}/page/${prev_page}/`;
	  let next_page = Math.min(total_pages, page + 1);
	  let next_page_url = `${page_base}/page/${next_page}/`;
  
	  page_html = '<div class="pages">\n<div class="fenye">';
	  page_html += `<a href="${first_page_url}" class="extend" title="跳转到首页">首页</a>`;
	  if (page > 1) page_html += `<a href="${prev_page_url}">上一页</a>`;
  
	  page_html += '&nbsp; &nbsp; <span class="pageobj-item">';
	  let start_page = Math.max(1, page - 2);
	  let end_page = Math.min(total_pages, page + 2);
	  if (page < 3) end_page = Math.min(total_pages, 5);
	  if (page > total_pages - 2) start_page = Math.max(1, total_pages - 4);
	  
	  for (let i = start_page; i <= end_page; i++) {
		let i_page_url = i === 1 ? first_page_url : `${page_base}/page/${i}/`;
		if (i === page) page_html += `<a href="${i_page_url}" class="current">${i}</a>`;
		else page_html += `<a href="${i_page_url}">${i}</a>`;
	  }
	  page_html += '&nbsp; &nbsp; </span>\n';
	  if (page < total_pages) page_html += `<a href="${next_page_url}">下一页</a>`;
	  page_html += `<a href="${last_page_url}" class="extend" title="跳转到最后一页">尾页</a>`;
	  page_html += `<span class="page-count pagedbox">${page}/${total_pages}</span>`;
	  page_html += '</div>\n</div>';
	}
	return page_html;
}
