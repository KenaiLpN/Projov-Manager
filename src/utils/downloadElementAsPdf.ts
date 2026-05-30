type PdfOrientation = "portrait" | "landscape";

interface DownloadElementAsPdfOptions {
  filename: string;
  orientation?: PdfOrientation;
}

export async function downloadElementAsPdf(
  element: HTMLElement,
  { filename, orientation = "landscape" }: DownloadElementAsPdfOptions
) {
  const html2canvas = (await import("html2canvas")).default;
  const jsPDF = (await import("jspdf")).jsPDF;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: element.scrollWidth,
  });

  const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let remaining = imgH;
  let first = true;

  while (remaining > 0) {
    if (!first) pdf.addPage();

    const sliceH = Math.min(pageH, remaining);
    const srcY = (imgH - remaining) * (canvas.height / imgH);
    const srcH = sliceH * (canvas.height / imgH);
    const sliceCanvas = document.createElement("canvas");

    sliceCanvas.width = canvas.width;
    sliceCanvas.height = srcH;
    sliceCanvas
      .getContext("2d")
      ?.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

    pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", 0, 0, imgW, sliceH);
    remaining -= pageH;
    first = false;
  }

  pdf.save(filename);
}
