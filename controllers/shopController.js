const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const { settings } = require('../settings.js');
const { getExecutable, saveToFile, log } = require('../utils/utils');

let browser = null;

exports.getAllProducts = async (req, res) => {
    const shop_username = req.params.shop_username.startsWith('@') ? req.params.shop_username.slice(1) : req.params.shop_username;
    let headless = req.query.browser ? (req.query.browser == 'true' ? false : true) : settings.BROWSER.HEADLESS;
    let allProducts = [];
    let totalProducts = 0;
    let msg = [];

    if (browser && browser.isConnected()) {
        return res.json({ msg: 'Server busy, try again in few minutes' });
    }

    browser = await openBrowser(headless);

    // const page = await browser.newPage();
    const pages = await browser.pages();
    const page = pages[0];
    await configurePage(page);

    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/v4/shop/rcmd_items')) {
            try {
                const json = await response.json();
                totalProducts = json.data.total;
                allProducts = allProducts.concat(json.data.centralize_item_card.item_cards);
            } catch (error) {
                log('Error parsing response:', 'error');
            }
        }
    });

    try {
        await page.goto(`https://shopee.vn/${shop_username}#product_list`, { waitUntil: 'networkidle2' });
        await checkUrls(page, msg);
        if (msg.length) return res.json({ msg, allProducts });
        log(`Opened Shop ${shop_username} page`);

        const numberOfPage = await page.$eval('.shopee-mini-page-controller__total', (el) => el.textContent.trim()).catch(() => null);
        if (numberOfPage > 1) {
            for (let i = 0; i < numberOfPage; i++) {
                const nextButton = await page.$("[class*='shopee-mini-page-controller__next-btn']");
                if (nextButton) {
                    await nextButton.click();
                }
                await page.waitForNetworkIdle();
            }
        }

        if (allProducts.length !== totalProducts) {
            msg = '!!! Not equal';
        }

        saveToFile(`${shop_username}.json`, allProducts);
        log(`${shop_username}.json Saved`);

        browser.close();
        return res.json({ msg, allProducts });
    } catch (e) {
        log(e, 'error');
        res.json(e);
    }
};

exports.getAllProductsCached = async (req, res) => {
    const shop_username = req.params.shop_username.startsWith('@') ? req.params.shop_username.slice(1) : req.params.shop_username;
    const data = await JSON.parse(fs.readFileSync(`./data/${shop_username}.json`, { encoding: 'utf8' }));
    return res.json(data);
};

exports.getProductDetail = async (req, res) => {
    const { item_name, shopid, itemid } = req.query;
    let headless = req.query.browser ? (req.query.browser == 'true' ? false : true) : settings.BROWSER.HEADLESS;
    let msg = [];
    if (!item_name || !shopid) {
        return res.status(400).json({ msg: 'Missing required query parameters: item_name or shopid' });
    }

    const productLink = generateProductLink(item_name, itemid, shopid);

    const browser = await openBrowser(headless);
    const page = await browser.newPage();
    await configurePage(page, msg);

    let productDetail = null;

    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/v4/pdp/get_pc')) {
            try {
                const json = await response.json();
                productDetail = json.data.item;
            } catch (error) {
                log('Error parsing product detail response:', 'error');
            }
        }
    });

    try {
        await page.goto(productLink, { waitUntil: 'networkidle2' });
        await checkUrls(page, []);
        if (!productDetail.title) {
            log('Failed to fetch product details', 'warning');
            return res.status(500).json({ msg: 'Failed to fetch product details' });
        }

        browser.close();
        return res.json({ msg: '', productDetail });
    } catch (e) {
        log(e, 'error');
        browser.close();
        return res.status(500).json(e);
    }
};

const configurePage = async (page) => {
    await page.setUserAgent(settings.BROWSER.USER_AGENT);
    await page.setExtraHTTPHeaders(settings.BROWSER.HEADER);

    await page.evaluateOnNewDocument(() => {
        (() => {
            const style = document.createElement('style');
            style.innerHTML = `
                * { 
                    animation: none !important; 
                    transition: none !important; 
                }
            `;
            document.head.appendChild(style);
        })();
    });

    log('Page configured');
};

const generateProductLink = (itemName, itemId, shopId) => {
    const slug = itemName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

    return `https://shopee.vn/${slug}-i.${shopId}.${itemId}`;
};

const openBrowser = async (headless = settings.BROWSER.HEADLESS) => {
    const browser = await puppeteer.launch({
        headless,
        defaultViewport: null,
        ignoreDefaultArgs: ['--enable-automation'],
        executablePath: getExecutable(),
        args: [`--user-data-dir=${settings.BROWSER.CHROME_PROFILE_PATH}`, ...settings.BROWSER.ARGS],
    });
    log('Browser opened');
    return browser;
};

const checkUrls = async (page, msg) => {
    const url = await page.url();

    if (url.includes('/verify/traffic')) {
        msg.push('Traffic error');
        log('Traffic error', 'warning');
    }

    if (url.includes('/verify/captcha')) {
        msg.push('Pls Solve captcha');
        log('Pls Solve captcha', 'warning');
    }

    if (url.includes('/buyer/login')) {
        msg.push('Pls Login again');
        log('Pls Login again', 'warning');
    }
};
