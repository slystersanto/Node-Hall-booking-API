const express = require("express");
const app = express();
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;
const URL=process.env.DB;


app.use(express.json());


app.get("/",(req,res)=>{
  res.send("Welcome to Hall-Booking API✔️✔️")
})



//creating a room
app.post("/createroom", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("Booking-Hall");
    const collection = db.collection("createrooms");
    const result = await collection.insertOne(req.body);
    await connection.close();
    res.status(200).json({ message: "Room created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});


//Booking a room
app.post("/bookroom", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("Booking-Hall");
    const collection = db.collection("bookingroom");
    const { customer_name, date, start_time, end_time, roomId } = req.body;
    const booking = await collection.insertOne({
      customer_name,
      date,
      start_time,
      end_time,
      roomId: new ObjectId(roomId)
    });
    await connection.close();
    res.status(200).json({ message: "Room booked successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});



//List all the rooms with booked data
app.get('/listrooms', async (req, res) => {
    try {
      const client = await mongoclient.connect(URL, { useUnifiedTopology: true });
      const db = client.db('Booking-Hall');
      const collection = db.collection('listalltherooms');
      const rooms = await collection.find({}).toArray();
  
      const result = rooms.map(room => ({
        room_name: room.room_name,
        book_status: room.book_status,
        customer_name: room.customer_name,
        start_time: room.start_time,
        end_time: room.end_time,
      }));
  
      await client.close();
      res.status(200).json({message:"Rooms with Booked Customers"});
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Something went wrong' });
    }
  });




  //List all the customers with Booked Data
  app.get('/bookings', async (req, res) => {
    try {
      const client = await mongoclient.connect(URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      const db = client.db('Booking-Hall');
      const bookings = await db.collection('listbookedcustomers').find({}).toArray();
    //   await connection.close()
      res.status(200).json({message:"Booked Customers List"});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
     } finally {
      client.close();
     }
  });


  //List how many times a customer has booked the room
  app.get("/bookings/:customer_name", async (req, res) => {
    try {
      const connection = await mongoclient.connect(URL);
      const db = connection.db("Booking-Hall");
      const collection = db.collection("listbookedcustomers");
  
      const customerName = req.params.customer_name;
  
      const bookings = await collection
        .find({ customer_name: customerName })
        .toArray();
  
      await connection.close();
      res.status(200).json({message:"Booked customers list"});
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  });


  //already booked the booking will be declined
  app.post("/bookroom", async (req, res) => {
    try {
      const connection = await mongoclient.connect(URL);
      const db = connection.db("Booking-Hall");
      const collection = db.collection("bookingroom");
      const { customer_name, date, start_time, end_time, roomId } = req.body;
  
      // Check if the room is already booked at the given time
      const existingBooking = await collection.findOne({
        date,
        roomId: new ObjectId(roomId),
        $or: [
          {
            start_time: { $lt: start_time },
            end_time: { $gt: start_time },
          },
          {
            start_time: { $lt: end_time },
            end_time: { $gt: end_time },
          },
          {
            start_time: { $gte: start_time },
            end_time: { $lte: end_time },
          },
        ],
      });
  
      if (existingBooking) {
        return res
          .status(400)
          .json({ message: "Room already booked at the given time" });
      }
  
      // Insert the booking
      const booking = await collection.insertOne({
        customer_name,
        date,
        start_time,
        end_time,
        roomId: new ObjectId(roomId),
      });
  
      await connection.close();
      res.status(200).json({ message: "Room booked successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  });
  
 


const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}...`));