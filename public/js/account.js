document.addEventListener('DOMContentLoaded', function() {
    // Wait for the DOM to be fully loaded
  
    var addGroupButton = document.getElementById('deleteAccount');
  
    if (addGroupButton) {
      addGroupButton.addEventListener('click', function(event) {
          // Prevent the default form submission
          event.preventDefault();
        
          if(confirm("Are you sure you want to delete your account?")) {
            window.location.replace(`/deleteAccount`);
          } 

          // Perform actions with the message value (e.g., submit the form via AJAX)
          console.log('Add Group clicked with value:', messageValue);
  
          // Add your logic here to handle the "Add Group" button click
          // For example, you can submit the form via AJAX or perform other actions
      });
    }
  });