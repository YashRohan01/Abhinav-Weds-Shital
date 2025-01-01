document.getElementById('rsvpForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission
  
    // Collect form data
    const name = document.getElementById('name').value.trim();
    const guests = document.getElementById('guests').value.trim();
    const arrival = document.getElementById('arrival').value.trim();
  
    if (!name || !guests || !arrival) {
      alert('Please fill out all fields.');
      return;
    }
  
    // Create the content for the .txt file
    const content = `Name: ${name}\nNumber of Guests: ${guests}\nEstimated Arrival: ${arrival}\n\n`;
  
    // Create a Blob object for the .txt file
    const blob = new Blob([content], { type: 'text/plain' });
  
    // Create a FormData object for the upload
    const formData = new FormData();
    formData.append('file', blob, `RSVP_${name.replace(/\s+/g, '_')}.txt`);
  
    // Send the .txt file to the server
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/uploadrsvp', true); // Use the /uploadrsvp endpoint
  
    // Handle successful submission
    xhr.onload = function () {
      if (xhr.status === 200) {
        alert('RSVP submitted successfully!');
        document.getElementById('rsvpForm').reset(); // Reset the form
      } else {
        alert(`Error occurred while submitting the RSVP: ${xhr.responseText}`);
      }
    };
  
    // Handle errors
    xhr.onerror = function () {
      alert('Failed to connect to the server.');
    };
  
    // Send the FormData
    xhr.send(formData);
  });
  