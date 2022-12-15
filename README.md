# simple i18n

A simple internationalization util for plain HTML.
Pull requests are welcome!

## usage example:
### Initialization
link simpleI18n to your HTML file
```html
<!--Simple i18n js file -->
<script src="./simpleI18n.js"></script>
```
Instantiate a simple i18n object after the DOM is loaded (``window.onload``),
and pass the path to the language file as a parameter.

parameter ``isMetaTranslated`` is optional, default is ``false``, 
which controls whether the meta tags and title are translated or not.

Initialize it by calling the ``init`` method.
```js
const simI18n = new SimI18n({
    fallbackLang: 'en_US',
    translations: {
        en_US: './lang/en.json',
        zh_Hans: './lang/zhHans.json'
    }
})
simI18n.init()
```
### Translation
Use `data-i18n` attribute to mark the element to be translated.
```html
<h1 data-i18n="hello"></h1>
<h2 data-i18n="obj.innerObj.innerKey"></h2>
```
Also, you can use `data-i18n-attr` to mark the attribute to be translated.
The instance below will translate the `placeholder` attribute of the element.
```html
<input 
    id="form-name" 
    type="text" 
    placeholder="Please enter your name" 
    data-i18n-attr="placeholder:form.namePlaceholder"
>
```
### Change language
```html
<button data-i18n="English" onclick="changeLang('en_US')">English</button>
<button data-i18n="sChinese" onclick="changeLang('zh_Hans')">Chinese</button>
```
Define variable before ``window.onload`` for later usage.
```js
let changeLang
```
In ``window.onload`` again, assignment the variable to the change language function.
```js
changeLang = (lang) => simI18n.setLang(lang)
```