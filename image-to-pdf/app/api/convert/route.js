import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import { IncomingForm } from 'formidable';

export const config = {
    api: {
        bodyParser: false,
    },
};

const parseForm = (req) =>
    new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields, files });
        });
    });

export async function POST(req) {
    try {
        const { files } = await parseForm(req);
        const fileArray = Array.isArray(files.image) ? files.image : [files.image];

        const pdfDoc = await PDFDocument.create();

        for (let file of fileArray) {
            const imgBuffer = await fs.readFile(file.filepath);
            const img = await pdfDoc.embedJpg(imgBuffer);
            const page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(img, {
                x: 0,
                y: 0,
                width: img.width,
                height: img.height,
            });
        }

        const pdfBytes = await pdfDoc.save();
        return new NextResponse(pdfBytes, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=image.pdf',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
