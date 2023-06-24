const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;
const uri = 'mongodb+srv://khizarshah3986:FZizK7pbKl9vkEeg@cluster.ebcaf2s.mongodb.net/?retryWrites=true&w=majority';

const database = 'Names';

let requestCount = 0;

app.use(express.json());
// ...
app.use(cors());
// ...


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/enrollment', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Set the CORS header
  
  const { enrollmentNumber } = req.body;

  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(database);
    const collection = db.collection('MarksName');
    const response = await collection.findOne({ enrollmentNumber });
    const isPresent = !!response;
    const name = isPresent ? response.name : null; // Extract the name if enrollment number is present
    const marksDistribution = isPresent ? response.marksDistribution : null; // Extract the marksDistribution if enrollment number is present
    const seatNo = isPresent ? response.seatNo : null; // Extract the seatNo if enrollment number is present
    res.json({ isPresent, name, marksDistribution,  seatNo });

    // Increment the request count
    requestCount++;
    console.log(`Request count: ${requestCount}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.close();
  }
  
});





app.post('/addData', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Set the CORS header
  const { enrollmentNumber, name, seatNo, marks, checkBoxChecked } = req.body;
  const defaultMarks = [
    [54, 53, 58, 61, 41, 38, 25, 29, 28, 26, 19, 24, 22, 20, 21, 21, 18, 20],
    [51, 59, 54, 58, 39, 38, 28, 25, 25, 27, 20, 24, 20, 21, 24, 23, 21, 22],
    [64, 50, 56, 53, 32, 45, 29, 27, 24, 25, 24, 24, 23, 22, 24, 23, 22, 22],
    [46, 52, 54, 51, 40, 44, 29, 28, 28, 25, 21, 24, 23, 22, 24, 23, 22, 21],
    [51, 48, 55, 52, 43, 46, 22, 25, 27, 26, 19, 24, 22, 20, 21, 15, 21, 19],
    [50, 52, 50, 43, 44, 45, 23, 24, 25, 27, 20, 23, 21, 22, 20, 22, 17, 20]

  ];

  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(database);
    const collection = db.collection('MarksName');

    // Check if the enrollment number already exists
    const existingData = await collection.findOne({ enrollmentNumber });
    if (existingData) {
      return res.status(400).json({ error: 'Enrollment number already exists' });
    }

    const randomNumber = Math.floor(Math.random() * 6); // Generates a random integer between 0 and 5


    let marksDistribution = defaultMarks[randomNumber];
    if (checkBoxChecked) {
      // Convert marks to integers
      const parsedMarks = marks.map(mark => parseInt(mark, 10));

      if (parsedMarks.length === 18) {
        marksDistribution = parsedMarks;
      }
    }

    const totalMarks = marksDistribution.reduce((sum, mark) => sum + mark, 0);

    // Add the data to the collection
    await collection.insertOne({
      enrollmentNumber,
      name,
      totalMarks,
      seatNo,
      marksDistribution
    });

    res.status(201).json({ message: 'Data added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.close();
  }
});








app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
