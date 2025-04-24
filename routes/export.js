const express = require('express');
const router = express.Router();
const PDFGenerator = require('../utils/pdfGenerator');
const ExcelHandler = require('../utils/excelHandler');

router.post('/export/pdf', async (req, res) => {
    try {
        const generator = new PDFGenerator(req.body.timetable);
        const filename = await generator.save(`exports/timetable_${Date.now()}.pdf`);
        res.download(filename);
    } catch (err) {
        res.status(500).send('Export failed');
    }
});

router.post('/export/excel', async (req, res) => {
    try {
        const exporter = new ExcelHandler();
        const filename = await exporter.exportTimetable(req.body.timetable);
        res.download(filename);
    } catch (err) {
        res.status(500).send('Excel export failed');
    }
});

module.exports = router;