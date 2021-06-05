'use strict'
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

const getHtml = async (htmlContent, content) => {
  try {
    const template = handlebars.compile(htmlContent);
    return template(content);
  } catch (e) {
    
    throw new Error(e);
  }
};

const generatePdf = async (htmlPath, dataToPrint, pdfName, outputDirectory) => {
  const buildPathHtml = path.resolve(htmlPath);
  const htmlContent = fs.readFileSync(
    buildPathHtml, "utf-8",
  );
  const html = await getHtml(htmlContent, dataToPrint);
  try {
    const browser = await puppeteer.launch({
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run',
        '--no-sandbox',
        '--no-zygote',
        '--single-process',
      ]
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const generatedPdfFile = path.join(outputDirectory,pdfName);
    await page.pdf({ path: generatedPdfFile, format: 'A4' });

    await browser.close();
    return generatedPdfFile;
  } catch (e) {
    //const customerMessage = "We were unable to generate the pdf file";
    
    throw new Error(e);
  }
};

module.exports = generatePdf;

