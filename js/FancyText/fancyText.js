
  // Wait for the CKEditor to be ready
  document.addEventListener('DOMContentLoaded', function () {
    ClassicEditor
      .create(document.querySelector('#editor'), {
        toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'undo', 'redo']
      })
      .then(editor => {
        
        document.getElementById('copy-to-clipboard').addEventListener('click', function () {
          try {
            const editorContent = editor.getData();
            const parser = new DOMParser();
            const doc = parser.parseFromString(editorContent, 'text/html');
            const styledTextContent = doc.body.innerText;
  
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = styledTextContent;
            document.body.appendChild(tempTextarea);
  
            tempTextarea.select();
            document.execCommand('copy');
  
            document.body.removeChild(tempTextarea);
            alert('Content copied to clipboard!');
          } catch (error) {
            console.error('Error copying content to clipboard:', error);
          }
        });
      })
      .catch(error => {
        console.error('Error initializing CKEditor:', error);
      });
  });
  

