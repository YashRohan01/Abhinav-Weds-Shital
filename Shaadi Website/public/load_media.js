const uploadForm = document.getElementById('uploadForm');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const videoInput = document.getElementById('video');
const loadProgressContainer = document.getElementById('loadProgressContainer');
const loadProgressBar = document.getElementById('loadProgressBar');

// Handle video loading progress
videoInput.addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (file) {
    loadProgressContainer.style.display = 'block';

    const fileReader = new FileReader();
    fileReader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentLoaded = (event.loaded / event.total) * 100;
        loadProgressBar.style.width = percentLoaded + '%';
      }
    };

    fileReader.onloadend = () => {
      loadProgressBar.style.width = '100%';
    };

    fileReader.onerror = () => {
      alert('Failed to load video.');
      loadProgressBar.style.backgroundColor = 'red';
    };

    fileReader.readAsDataURL(file);
  }
});

// Handle form submission and upload progress
uploadForm.onsubmit = (event) => {
  event.preventDefault();  // Prevent form from submitting normally

  const formData = new FormData(uploadForm);

  // Show progress bar
  progressContainer.style.display = 'block';

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload', true);

  let currentProgress = 0;  // Fake progress to update the progress bar

  // Fake progress bar update
  const interval = setInterval(() => {
    if (currentProgress < 95) {
      currentProgress += 2;  // Speed up the fake progress
      progressBar.style.width = currentProgress + '%';
    }
  }, 30);  // Interval for fake progress update

  // Actual upload progress
  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      // Sync real progress with fake progress
      const realProgress = (event.loaded / event.total) * 100;
      currentProgress = Math.max(realProgress, currentProgress); // Make sure the fake progress doesn't go backwards
      progressBar.style.width = currentProgress + '%';
    }
  };

  // When the upload is complete
  xhr.onload = () => {
    clearInterval(interval);  // Stop the fake progress
    progressBar.style.width = '100%';  // Finish the progress bar
    progressBar.style.backgroundColor = '#B8A9D3';  // Change color to green
    alert('Video uploaded successfully!');
    location.reload();  // Refresh the page
  };

  // Error handling
  xhr.onerror = () => {
    clearInterval(interval);  // Stop the fake progress
    progressBar.style.backgroundColor = 'red';  // Set color to red for error
    alert('Error occurred while uploading the video.');
  };

  // Send the form data
  xhr.send(formData);
};
