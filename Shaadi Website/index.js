import express from "express";
import bodyParser from "body-parser";
import passport from "passport";
import session from "express-session";
import env from "dotenv";
import multer from "multer";
import { google } from "googleapis";
import fs from "fs";
import nodemailer from "nodemailer";

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB limit
  },
});

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Use environment variable
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = google.drive({ version: 'v3', auth });

env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // To parse form data

app.use(passport.initialize());
app.use(passport.session());

app.get("/",(req,res) => {
    res.render("home.ejs");
});

app.get("/home", (req,res) => {
  res.render("home.ejs");
});

app.get("/venue", (req,res) => {
  res.render("venue.ejs");
});

app.get("/gallery",(req,res)=>{
  res.render("gallery.ejs");
});

app.get("/guestbook",(req,res) => {
  res.render("guestbook.ejs");
});

app.get('/rsvp',(req,res) => {
  res.render('rsvp.ejs');
});

app.get('/contact_us',(req,res) => {
  res.render('contactus.ejs');
});

app.get('/all_images',(req,res) => {
  res.render('waiting.ejs');
});

app.get('/mehendi',(req,res) => {
  res.render('waiting.ejs');
});

app.get('/pool_party',(req,res) => {
  res.render('waiting.ejs');
});

app.get('/sangeet',(req,res) => {
  res.render('waiting.ejs');
});

app.get('/bachelor_party', (req, res) => {
  res.render('password_prompt.ejs');
});

app.get('/beach',(req,res) => {
  res.render('waiting.ejs');
});

app.get('/hadli',(req,res) => {
  res.render('waiting.ejs');
});

app.get('/jaimala',(req,res) => {
  res.render('waiting.ejs');
});

app.post('/check_password', (req, res) => {
  const enteredPassword = req.body.password;
  
  // Replace this with your actual password checking logic
  const correctPassword = '#abshit';

  if (enteredPassword === correctPassword) {
    // Redirect to the intended page after successful password check
    res.render('waiting.ejs');
  } else {
    // If password is incorrect, you can redirect to an error page or show a message
    res.send('Wrong Password');
  }
});

app.post('/uploadtribute', upload.single('video'), async (req, res) => {
  try {
    // Upload file to Google Drive
    const fileMetadata = {
      name: req.file.originalname, // File name
      parents : ['1pD-Jx8jvTHnlYV6YkQkRKvWMtYsCsJeO']
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
    console.log('File uploaded:', response.data);

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    res.send(`
      <script>
        alert("Video uploaded successfully!");
        window.location.href = "/guestbook"; // Redirect to the guestbook page or any other page you want
      </script>
    `);
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    res.status(500).send('Failed to upload video');
  }
});

app.post('/uploadgallery', upload.single('media'), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    // Check MIME type of the uploaded file (either video or image)
    const mimeType = req.file.mimetype;
    if (!mimeType.startsWith('video/') && !mimeType.startsWith('image/')) {
      return res.status(400).send('Invalid file type. Only video and image files are allowed.');
    }

    // Upload file to Google Drive
    const fileMetadata = {
      name: req.file.originalname, // File name
      parents: ['1loTqcNJLcthjPUs0e4nE1dnzN__1SlB6'], // Folder ID on Google Drive
    };
    const media = {
      mimeType: req.file.mimetype, // Use the MIME type from the uploaded file
      body: fs.createReadStream(req.file.path), // Path to the uploaded file
    };

    // Upload to Google Drive
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log('File uploaded:', response.data);

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    // Return success response with redirection
    res.send(`
      <script>
        alert("File uploaded successfully!");
        window.location.href = "/gallery"; // Redirect to guestbook or any other page
      </script>
    `);
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    res.status(500).send('Failed to upload file');
  }
});

app.post('/uploadrsvp', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const fileMetadata = {
      name: req.file.originalname,
      parents: ['1UPr038D1CExDHPkeeKSbq7j447jnbFdG'],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    console.log('RSVP File uploaded:', response.data);

    // Asynchronously delete the file after upload
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File successfully deleted.');
      }
    });

    res.status(200).send('RSVP successfully uploaded.');
  } catch (error) {
    console.error('Error uploading RSVP file:', error);
    res.status(500).send('Failed to upload RSVP.');
  }
});

app.post('/submit', async (req, res) => {
  const { name, email, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).send('All fields are required.');
  }

  // Create a transporter object for Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth:{
      user: "abhinavwedsshital@gmail.com",
      pass: process.env.EMAIL_PASS
    }
  });

  // Email options
  const mailOptions = {
    from: `"${name}" <${email}>`, // Sender's email and name
    to: 'abhinavwedsshital@gmail.com', // Replace with your email address
    subject: 'New Message from Contact Form', // Subject
    text: `You have received a new message from ${name} (${email}):\n\n${message}`, // Email body
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions,(error,emailResponse) =>{
      if (error)
        throw error;
      console.log("success!")
    });

    console.log('Email sent successfully');

    // Send success response
    res.send(`
      <script>
        alert("Message sent successfully!");
        window.location.href = "/contact_us"; // Redirect to the contact page or any other page
      </script>
    `);
  } catch (error) {
    console.error('Error sending email:', error);

    // Send failure response
    res.status(500).send(`
      <script>
        alert("Could not send mail. Try again later");
        window.location.href = "/contact_us"; // Redirect to the contact page or any other page
      </script>
    `);
  }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
