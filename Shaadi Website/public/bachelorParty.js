const password = "#abshit"; // Change this to your desired password

// Route to check if the entered password is correct
app.post('/check_password', (req, res) => {
    const enteredPassword = req.body.password; // Get the password from the form

    if (enteredPassword === password) {
        // If password is correct, render the bachelor party page
        res.render('waiting.ejs');
    } else {
        // If password is incorrect, show an error or redirect back to the prompt
        res.send("Incorrect password. Please try again.");
    }
});
