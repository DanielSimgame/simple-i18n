/**
 * @description deep search
 * @param {Object} obj the object to search
 * @param {string} key the key to search
 * @return {string} value: the value of the key
 * */
function deepSearch(obj, key) {
    if (typeof obj !== 'object') {
        return key
    }

    if (obj.hasOwnProperty(key)) {
        return obj[key]
    }

    for (let i in obj) {
        if (!(obj[i] instanceof Object)) {
            continue
        }

        const value = deepSearch(obj[i], key)
        if (!value) {
            continue
        }
        return value
    }
}

/**
 * @description get current language, if fallback, set localStorage = fallbackLang
 * @return {string} lang
 * */
function getLang () {
    const currentLang = localStorage.getItem('lang')
    if (!currentLang || currentLang === 'undefined') {
        localStorage.setItem('lang', this.fallbackLang)
        return this.fallbackLang
    }
    return currentLang
}

/**
 * @description returns the translation of a string,
 * get translations from json file, data structure of json:
 *      {
 *          language: 'en_US',
 *          translations: {
 *              'key': 'value',
 *              group: {
 *                  'key': 'value'
 *              }
 *          }
 *      }
 * @param {Object} simI18n the simple I18n object
 * @param {string} key the key of the translation
 * @param {boolean} isMeta is meta description, keywords, title
 * @return {string} the translation
 * */
function translate(simI18n, key, isMeta = false) {
    const json = simI18n.languageJson
    const metaJson = simI18n.languageJson
    // Optimized object size for deep search
    delete metaJson.languageJson
    const keys = key.split('.')

    if (keys.includes('getLang')) {
        return simI18n.getLocalizedLang()
    }

    let value = isMeta ? metaJson : json.translations

    if (keys.length === 1) {
        return !value ? key : value[key]
    }

    // if keys.length > 1, deep search
    for (let i = 0; i < keys.length; i++) {
        value = deepSearch(value, keys[i])
    }

    // if the value is an empty string, return it as it was
    if (value === '') {
        return ''
    }

    // Validation: if value doesn't exist then return key string
    return !value ? key : value
}

/**
 * @description Get language translations json file by Fetch()
 * // no-cors, *cors, same-origin
 * */
const getJson = (url) => fetch(url, {mode: 'cors'})
    .then((res) => res.json())
    .then((json) => json)

/**
 * @description Replace all elements who have data-i18n attribute with translations key.
 * */
function init(simI18n) {
    // wait for language json file loaded to translate
    getJson(`${simI18n.translations[simI18n.lang]}`)
        .then(json => {
            // once got json contents, define languageJson & simI18n.t
            simI18n.languageJson = json
            simI18n.t = (key, isMeta = false) => translate(simI18n, key, isMeta)

            // page title & meta description, keywords
            if (simI18n.isMetaTranslated) {
                simI18n.setPageMeta()
            }

            const elements = document.querySelectorAll('[data-i18n]')
            elements.forEach((element) => {
                element.innerHTML = simI18n.t(element.dataset.i18n)
            })

            /* data-i18n-attr example: placeholder:form.placeholder,
            * means set placeholder in translation form.placeholder,
            * use ':' to split attribute and key
            */
            const elementsAttr = document.querySelectorAll('[data-i18n-attr]')
            elementsAttr.forEach((element) => {
                const [attr, key] = element.dataset.i18nAttr.split(':')
                element.setAttribute(attr, simI18n.t(key))
            })
        })
}

/**
 * @description Simple I18n, get translations from json file.
 * @param {Object} options the options of the I18n
 * */
const SimI18n = function (options = {
    lang: 'en_US',
    fallbackLang: 'en_US',
    translations: {},
    isMetaTranslated: false,
}) {
    //Factory
    let simI18n = {}
    simI18n.languageJson = {}
    simI18n.lang = options.lang || getLang()
    simI18n.fallbackLang = options.fallbackLang || 'en_US'
    simI18n.translations = options.translations || {}

    /**
     * @description language switch, languages: zh_Hans, en_US
     * @param {string} lang language code
     * */
    simI18n.setLang = function (lang) {
        localStorage.setItem('lang', lang)
        this.lang = lang
        window.location.reload()
    }

    if (!simI18n.translations.hasOwnProperty(simI18n.lang)) {
        const errorLang = simI18n.lang
        simI18n?.setLang(simI18n?.fallbackLang)
        throw new Error(`The language ${errorLang} is not supported.`)
    }

    simI18n.getLang = () => getLang()

    simI18n.getLocalizedLang = function () {
        return this.languageJson?.['localizedLanguage'] || this.getLang()
    }

    /*
    * Set meta description, keywords, title
    * */
    simI18n.setPageMeta = function () {
        const currentPage = window.location.pathname.split('/').pop().split('.').shift()
        document.title = simI18n.t(`titles.${currentPage}`, true)
        document.querySelector('meta[name="description"]')
            .setAttribute('content', simI18n.t(`descriptions.${currentPage}`))
        document.querySelector('meta[name="keywords"]')
            .setAttribute('content', simI18n.t(`keywords.${currentPage}`))
    }

    simI18n.init = () => init(simI18n)

    return simI18n
}