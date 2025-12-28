
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Enhanced PDF Export Service
 * Fixes clipping issues and handles multi-page content for Hebrew/RTL
 */

export const exportElementToPdf = async (
  elementId: string, 
  filename: string, 
  institutionName: string
) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Prepare element for snapshot - prevent clipping
  const originalStyle = element.style.cssText;
  element.style.height = 'auto';
  element.style.overflow = 'visible';
  element.style.maxWidth = 'none';

  try {
    // Add branding footer
    const footer = document.createElement('div');
    footer.id = 'temp-pdf-footer';
    footer.style.cssText = 'text-align:center; padding:20px; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; margin-top:40px;';
    footer.dir = 'rtl';
    footer.innerText = `הופק על ידי שבו"ש - ON • עבור ${institutionName} • ${new Date().toLocaleDateString('he-IL')}`;
    element.appendChild(footer);

    const canvas = await html2canvas(element, {
      scale: 2, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    // Cleanup
    const tempFooter = document.getElementById('temp-pdf-footer');
    if (tempFooter) element.removeChild(tempFooter);
    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const canvasHeightInPdf = (imgProps.height * pdfWidth) / imgProps.width;

    // If content is longer than one A4, we might need multiple pages 
    // but usually for a profile snapshot we just scale it or use long-page.
    // For single profile, we let it be one long image for clarity, 
    // or we can slice it if requested.
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, canvasHeightInPdf);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    alert("שגיאה ביצירת הקובץ. אנא נסה שוב.");
    element.style.cssText = originalStyle;
  }
};

/**
 * Special Catalog Exporter (12 per page)
 */
export const exportCatalogToPdf = async (
  candidates: any[],
  institutionName: string
) => {
  // Create hidden container for catalog rendering
  const container = document.createElement('div');
  container.id = 'catalog-export-container';
  container.dir = 'rtl';
  container.style.cssText = `
    position: fixed; 
    left: -9999px; 
    top: 0; 
    width: 210mm; 
    background: white; 
    padding: 15mm; 
    font-family: 'Assistant', sans-serif;
  `;

  document.body.appendChild(container);

  const ITEMS_PER_PAGE = 12;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();

  // Group candidates by yeshiva
  const sorted = [...candidates].sort((a, b) => 
    (a.current_yeshiva || '').localeCompare(b.current_yeshiva || '')
  );

  for (let i = 0; i < sorted.length; i += ITEMS_PER_PAGE) {
    const pageItems = sorted.slice(i, i + ITEMS_PER_PAGE);
    
    // Render current page content
    container.innerHTML = `
      <div style="margin-bottom: 10mm; border-bottom: 2px solid #003366; padding-bottom: 5mm; display: flex; justify-content: space-between; align-items: center;">
        <h1 style="color: #003366; margin: 0; font-size: 24px;">קטלוג שבו"שים - ${institutionName}</h1>
        <span style="color: #64748b; font-size: 14px;">עמוד ${Math.floor(i / ITEMS_PER_PAGE) + 1}</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8mm;">
        ${pageItems.map(c => `
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 4mm; text-align: center; background: #f8fafc;">
            <div style="width: 35mm; height: 35mm; background: #e2e8f0; margin: 0 auto 3mm auto; border-radius: 6px; overflow: hidden;">
              ${c.photo ? `<img src="${c.photo}" style="width: 100%; height: 100%; object-cover: cover;" />` : `<div style="padding-top: 12mm; font-weight: bold; color: #94a3b8;">ללא תמונה</div>`}
            </div>
            <div style="font-weight: 900; font-size: 16px; color: #1e293b; margin-bottom: 1mm;">${c.full_name}</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 2mm;">${c.current_yeshiva || 'מוסד לא ידוע'}</div>
            <div style="font-size: 13px; font-weight: bold; color: #003366; font-family: monospace;">${c.phone}</div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 10mm; text-align: center; font-size: 10px; color: #94a3b8;">
        הופק בתאריך ${new Date().toLocaleDateString('he-IL')} על ידי שבו"ש-ON
      </div>
    `;

    const canvas = await html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
  }

  pdf.save(`Catalog_${institutionName}.pdf`);
  document.body.removeChild(container);
};
