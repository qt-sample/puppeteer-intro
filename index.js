const puppeteer = require('puppeteer');
const dotenv = require('dotenv');

const NUMBER_OF_DIGITS = {
  million: 10 ** 6,
  billion: 10 ** 9,
  trillion: 10 ** 12,
}
// match numbers with decimals and trailing word (without (k))
const NUMBERS_PLUS_NEXT_WORD = /[1-9]\d*(\.\d+)(\s\w+)(?!(k))?/g

const convertToNumber = (value, type) => {
  if (!value || !type || !NUMBER_OF_DIGITS[type]) return null

  return Number(value) * NUMBER_OF_DIGITS[type]
}

const navigateCareers = async ({
  page
}) => {
  await page.goto('https://www.hicapitalize.com/')

  const [carrers] = await page.$x('//a[contains(text(), "Careers")]')
  if (carrers) {
    await carrers.click()
  }

  await page.waitForNavigation({
    waitUntil: 'networkidle0'
  })
  for (const iFrame of page.mainFrame().childFrames()) {
    await page.goto(iFrame.url())
  }

  const urls = await page.evaluate(() => {
    let results = []
    let items = document.querySelectorAll('a')
    items.forEach((item) => {
      results.push({
        url: item.getAttribute('href'),
        text: item.innerText,
      })
    })
    return results
  })
  const fullStackJobUrl = urls.find(url => url.text ===
    'Full Stack Engineer').url
  await Promise.all([
    page.goto(fullStackJobUrl)
  ])

  await page.screenshot({
    encoding: 'base64',
    path: './screenshots/fullstack.jpeg',
    type: 'jpeg',
  })

  return fullStackJobUrl
}

const navigateRolloversMadeEasy = async ({
  browser
}) => {
  const rolloversMadeEasy = await browser.newPage()
  await rolloversMadeEasy.goto(
    'https://www.hicapitalize.com/resources/the-true-cost-of-forgotten-401ks/'
  )

  const firstParagraph = await rolloversMadeEasy.evaluate(() => {
    let paragraphs = document.querySelectorAll('p')
    return paragraphs[0].innerText
  })

  let values
  if (firstParagraph) {
    values = firstParagraph.match(NUMBERS_PLUS_NEXT_WORD)
    values = values.map(value => {
      const [numberAsString, type] = value.split(' ')
      return convertToNumber(numberAsString, type)
    })
  }

  return values
}

const navigateCapitalize = async ({
  isHeadless
}) => {
  const browser = await puppeteer.launch({
    headless: isHeadless,
  })

  const [page] = await browser.pages()

  const fullStackJobUrl = await navigateCareers({
    page
  })
  const values = await navigateRolloversMadeEasy({
    browser
  })

  await browser.close()

  return {
    fullStackJobUrl,
    values,
  }
}

const clickStar = async ({
  isHeadless
}) => {
  dotenv.config()

  const browser = await puppeteer.launch({
    headless: isHeadless,
  })
  const [page] = await browser.pages()

  await page.goto('https://github.com/login')
  await page.type("#login_field", process.env.GITHUB_LOGIN)
  await page.type("#password", process.env.GITHUB_PASS)
  await Promise.all([
    page.click('input[type="submit"]'),
    page.waitForNavigation({
      waitUntil: 'networkidle0'
    }),
  ])

  const [puppeteerIntro] = await page.$x(
    '//a[contains(., "puppeteer-intro")]')
  if (puppeteerIntro) {
    await puppeteerIntro.click()
  }

  await page.waitForNavigation({
    waitUntil: 'networkidle0'
  })

  try {
    const [star] = await page.$x("//button[contains(., 'Star')]")
    if (star) {
      await star.click()
    }
  } catch (error) {
    await browser.close()
    return new Error('Requested repository already starred.')
  }

  await browser.close()
}

const main = async () => {
  const args = process.argv.slice(2) || []
  let isHeadless = true

  args.forEach(arg => {
    if (arg === '--headless=false') {
      isHeadless = false
    }
  })

  await clickStar({
    isHeadless
  })

  await navigateCapitalize({
      isHeadless
    })
    .then(resp => ({
      abandonedAccounts: resp.values[0],
      abandonedAccountsValue: resp.values[1],
      fullStackJobUrl: resp.fullStackJobUrl,
    }))
}

main()