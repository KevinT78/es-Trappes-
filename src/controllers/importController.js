// const xlsx = require('xlsx');
// const Member = require('../models/Member');

// exports.importMembers = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'Please upload a file' });
//     }

//     const workbook = xlsx.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const data = xlsx.utils.sheet_to_json(worksheet);

//     const members = await Member.insertMany(data);
//     res.status(201).json({ 
//       message: `Successfully imported ${members.length} members`,
//       members 
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };




const xlsx = require('xlsx');

exports.importMembers = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetNames = workbook.SheetNames;

    const data = {};
    sheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        data[sheetName] = xlsx.utils.sheet_to_json(worksheet);
    });

    // Votre logique pour traiter les données importées
    console.log(data);

    res.send('Members imported successfully');
};
