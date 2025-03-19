const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const { settings } = require('../settings.js');
const { getExecutable, saveToFile, log } = require('../utils/utils');

let browser = null;

exports.getAllProducts = async (req, res) => {
    const shop_id = req.params.shop_id.startsWith('@') ? req.params.shop_id.slice(1) : req.params.shop_id;
    let headless = req.query.browser ? (req.query.browser == 'true' ? false : true) : settings.BROWSER.HEADLESS;
    let allProducts = [];
    let totalProducts = 0;
    let msg = [];

    if (browser && browser.isConnected()) {
        return res.json({ msg: 'Server busy, try again in few minutes' });
    }

    browser = await puppeteer.launch({
        headless,
        defaultViewport: null,
        ignoreDefaultArgs: ['--enable-automation'],
        executablePath: getExecutable(),
        args: [`--user-data-dir=${settings.BROWSER.CHROME_PROFILE_PATH}`, ...settings.BROWSER.ARGS],
    });
    log(`browser Opened`);

    // const page = await browser.newPage();
    const pages = await browser.pages();
    const page = pages[0];
    await page.setUserAgent(settings.BROWSER.USER_AGENT);
    await page.setExtraHTTPHeaders(settings.BROWSER.HEADER);

    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/api/v4/shop/rcmd_items')) {
            try {
                const json = await response.json();
                totalProducts = json.data.total;
                allProducts = allProducts.concat(json.data.centralize_item_card.item_cards);
            } catch (error) {
                console.error('Error parsing response:', error);
            }
        }
    });

    await page.evaluateOnNewDocument(() => {
        const disableAnimations = () => {
            const style = document.createElement('style');
            style.innerHTML = `
                * { 
                    animation: none !important; 
                    transition: none !important; 
                }
            `;
            document.head.appendChild(style);
        };
        disableAnimations();
    });

    try {
        await page.goto(`https://shopee.vn/${shop_id}#product_list`, { waitUntil: 'networkidle2' });
        await checkUrls(page, msg);
        if (msg.length) return res.json({ msg, allProducts });
        log(`Opened Shop ${shop_id} page`);

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

        saveToFile(`${shop_id}.json`, allProducts);
        log(`${shop_id}.json Saved`);

        browser.close();
        return res.json({ msg, allProducts });
    } catch (e) {
        log(e, 'error');
        res.json(e);
    }
};

exports.getAllProductsCached = async (req, res) => {
    const shop_id = req.params.shop_id.startsWith('@') ? req.params.shop_id.slice(1) : req.params.shop_id;
    const data = await JSON.parse(fs.readFileSync(`./data/${shop_id}.json`, { encoding: 'utf8' }));
    return res.json(data);
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
