document.addEventListener('DOMContentLoaded', function() {
  // Wait for the DOM to be fully loaded

  // Add event listeners for each "Update Status!" button
  var updateButtons = document.querySelectorAll('.update-status-button');

  updateButtons.forEach(function(button) {
      button.addEventListener('click', function() {
          // Get the message ID from the data attribute
          var messageId = button.getAttribute('data-message-id');
          
          // Perform actions based on the clicked button and message ID
          console.log('Update Status clicked for message ID:', messageId);

          window.location.replace(`/getPool?id=${messageId}`);
          
          // You can now use the messageId to update the status or perform other actions
      });
  });
  var addGroupButton = document.getElementById('addGroup');

  if (addGroupButton) {
    addGroupButton.addEventListener('click', function(event) {
        // Prevent the default form submission
        event.preventDefault();

        // Get the value from the input field
        var messageInput = document.getElementById('message');
        var messageValue = messageInput.value;

        if (!messageValue) {
            // The message is empty, do nothing
            return;
        } 
        const isValid = /^[0-9a-fA-F]{24}$/.test(messageValue);
        if (!isValid) {
          alert('Invalid ID')
          return
        }
        window.location.replace(`/addPool?id=${messageValue}`);
        

        // Perform actions with the message value (e.g., submit the form via AJAX)
        console.log('Add Group clicked with value:', messageValue);

        // Add your logic here to handle the "Add Group" button click
        // For example, you can submit the form via AJAX or perform other actions
    });
  }

  var createGroupButton = document.getElementById('createGroup');

  if (createGroupButton) {
    createGroupButton.addEventListener('click', function(event) {
        // Prevent the default form submission
        event.preventDefault();

        // Get the value from the input field
        var messageInput = document.getElementById('create');
        var messageValue = messageInput.value;
        messageValue = {message: messageValue}

        if (!messageValue || messageValue.message === '') {
            // The message is empty, do nothing
            return;
        } 

        fetch('/createGroup', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageValue)
      })
      .then(response => response.json())
      .then(data => {
          console.log('Success:', data);
          window.location.reload();
          // Add your logic here for handling the success response
      })
      .catch(error => {
          console.error('Error:', error);
          // Add your logic here for handling errors
      });
  
        // You can now use the messageId to update the status or perform other actions


        // Perform actions with the message value (e.g., submit the form via AJAX)
        console.log('Add Group clicked with value:', messageValue);

        // Add your logic here to handle the "Add Group" button click
        // For example, you can submit the form via AJAX or perform other actions
    });
  }
});
