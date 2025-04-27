import { Router } from 'express';
import * as exportMethods from '../data/exports.js';

const router = Router();

router.route('/csv').get(async (req, res) => {
  try {
    const filePath = await exportMethods.exportToCSV();
    res.download(filePath, 'data.csv');
  } catch (e) {
    return res.status(500).json(e);
  }
  //code here for GET
});


router.route('/pdf').get(async (req, res) => {
  try {
    const filePath = await exportMethods.exportToPDF();
    res.download(filePath, 'data.csv');
  } catch (e) {
    return res.status(500).json(e);
  }
  //code here for GET
});


export default router;