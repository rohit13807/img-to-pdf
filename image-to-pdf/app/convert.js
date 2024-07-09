import nextConnect from 'next-connect';
import multiparty from 'multiparty';
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';

const handler = nextConnect();

handler.use((req, res, next) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        req.body = fields;
        req.files = files;
        next();
    });
});

handler.post(async (req, res) => {
    try {
        const files = req.files.image;
        const pdfDoc = await PDFDocument.create();

        for (let file of files) {
            const imgBuffer = fs.readFileSync(file.path);
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
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=image.pdf',
        });
        res.end(pdfBytes);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default handler;

export const config = {
    api: {
        bodyParser: false,
    },
};
