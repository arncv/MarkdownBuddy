import { marked } from 'marked';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, TableCell, Table, TableRow } from 'docx';
import * as puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';

export class ExportService {
  private async convertMarkdownToHTML(markdown: string): Promise<string> {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
    return marked(markdown);
  }

  async toPDF(markdown: string, title: string): Promise<Buffer> {
    const html = await this.convertMarkdownToHTML(markdown);
    
    // Add styling for PDF
    const styledHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body {
              font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.6;
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 1.5em;
              margin-bottom: 0.5em;
              font-weight: 600;
            }
            pre {
              background: #f6f8fa;
              padding: 1em;
              border-radius: 4px;
              overflow-x: auto;
            }
            code {
              background: #f6f8fa;
              padding: 0.2em 0.4em;
              border-radius: 3px;
            }
            blockquote {
              border-left: 4px solid #dfe2e5;
              padding-left: 1em;
              color: #6a737d;
              margin: 1em 0;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1em 0;
            }
            th, td {
              border: 1px solid #dfe2e5;
              padding: 0.5em 1em;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(styledHTML);
      
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '2.5cm',
          right: '2.5cm',
          bottom: '2.5cm',
          left: '2.5cm'
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%;">
            ${title}
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async toHTML(markdown: string, title: string): Promise<string> {
    const html = await this.convertMarkdownToHTML(markdown);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body {
              font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.6;
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
              color: #24292e;
            }
            pre {
              background: #f6f8fa;
              padding: 1em;
              border-radius: 4px;
              overflow-x: auto;
            }
            code {
              background: #f6f8fa;
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
            }
            blockquote {
              border-left: 4px solid #dfe2e5;
              padding-left: 1em;
              color: #6a737d;
              margin: 1em 0;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1em 0;
            }
            th, td {
              border: 1px solid #dfe2e5;
              padding: 0.5em 1em;
            }
            a {
              color: #0366d6;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${html}
        </body>
      </html>
    `;
  }

  async toDOCX(markdown: string, title: string): Promise<Buffer> {
    const html = await this.convertMarkdownToHTML(markdown);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
          }),
          ...this.htmlToDocxElements(document.body)
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    return Buffer.from(buffer);
  }

  private htmlToDocxElements(element: Element): any[] {
    const elements: any[] = [];
    const headingMap = {
      'h1': HeadingLevel.HEADING_1,
      'h2': HeadingLevel.HEADING_2,
      'h3': HeadingLevel.HEADING_3,
      'h4': HeadingLevel.HEADING_4,
      'h5': HeadingLevel.HEADING_5,
      'h6': HeadingLevel.HEADING_6,
    };
    
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === node.TEXT_NODE) {
        if (node.textContent?.trim()) {
          elements.push(
            new Paragraph({
              children: [new TextRun(node.textContent)],
            })
          );
        }
      } else if (node instanceof Element) {
        const tagName = node.tagName.toLowerCase();
        
        if (tagName in headingMap) {
          elements.push(
            new Paragraph({
              text: node.textContent || '',
              heading: headingMap[tagName as keyof typeof headingMap],
            })
          );
        } else {
          switch (tagName) {
            case 'p':
              elements.push(
                new Paragraph({
                  children: [new TextRun(node.textContent || '')],
                })
              );
              break;
            
            case 'ul':
            case 'ol':
              Array.from(node.children).forEach(li => {
                elements.push(
                  new Paragraph({
                    children: [new TextRun(`• ${li.textContent}`)],
                    indent: { left: 720 }, // 0.5 inch
                  })
                );
              });
              break;
            
            case 'table':
              const rows = Array.from(node.querySelectorAll('tr')).map(tr =>
                new TableRow({
                  children: Array.from(tr.children).map(td =>
                    new TableCell({
                      children: [new Paragraph(td.textContent || '')],
                    })
                  ),
                })
              );
              
              if (rows.length > 0) {
                elements.push(
                  new Table({
                    rows,
                  })
                );
              }
              break;
            
            default:
              elements.push(...this.htmlToDocxElements(node));
          }
        }
      }
    }
    
    return elements;
  }
}