import { Router } from 'express';
import * as exportMethods from '../data/exports.js';

const router = Router();

router.route('/csv').get(async (req, res) => {
  try {
    const filePath = await exportMethods.exportToCSV();
    res.download(filePath, 'NYC_Capital_Budget_Projects.csv');
  } catch (e) {
    return res.status(500).json(e);
  }
  //code here for GET
});


router.route('/pdf').get(async (req, res) => {
  try {
    const filePath = await exportMethods.exportToPDF();
    res.download(filePath, 'NYC_Capital_Budget_Projects.pdf');
  } catch (e) {
    return res.status(500).json(e);
  }
  //code here for GET
});


export default router;