import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Paper,
  Fab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';

const CollapsibleTable = () => {
  const [openRows, setOpenRows] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [textValue, setTextValue] = useState('');

  const handleRowToggle = (index) => {
    setOpenRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const showTextBox = () => {
    setOpenDialog(true); // Open the dialog (popup) when floating button is clicked
  };

  const handleClose = () => {
    setOpenDialog(false); // Close the dialog
  };

  const handleSubmit = () => {
    alert(`Submitted text: ${textValue}`); // Handle form submission
    setOpenDialog(false); // Close the dialog after submitting
    setTextValue(''); // Clear the input field
  };

  const data = [
    { id: 1, name: 'John Doe', age: 25, details: '◉ Some extra details for John' },
    { id: 2, name: 'Jane Smith', age: 30, details: '▸ Some extra details for Jane' },
    { id: 3, name: 'Mark Johnson', age: 35, details: '• Some extra details for Mark' },
  ];

  return (
    <div>
      <TableContainer
        component={Paper}
        sx={{
          position: 'relative',
          width: '60%', // Adjust the percentage to shrink the width as needed
          margin: '0 auto', // Center the table container horizontally
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  height: '50px',  // More reasonable height
                  width: '20px',  // Adjust width to your preference
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center', // Center vertically
                }}
              >
                Education
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <React.Fragment key={row.id}>
                {/* Make the entire row clickable by adding an onClick handler */}
                <TableRow
                  hover
                  onClick={() => handleRowToggle(index)}
                  sx={{ cursor: 'pointer' }} // This makes the row look clickable
                >
                  <IconButton>
                    {openRows[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell></TableCell>
                </TableRow>

                {/* Collapsible row that will show more details */}
                <TableRow>
                  <TableCell colSpan={3}>
                    <Collapse in={openRows[index]}>
                      <div>{row.details}</div>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>

        {/* Floating action button inside the container */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={showTextBox}
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 1000, // Ensure it's on top of the table
          }}
        >
          <AddIcon />
        </Fab>
      </TableContainer>

      {/* Dialog (Popup with TextBox and Submit Button) */}
      <Dialog
        open={openDialog}
        onClose={(e, reason) => {
          // Prevent closing the dialog when clicking outside
          if (reason === 'backdropClick') return; 
          setOpenDialog(false); // Handle closing in other cases (e.g., submit or cancel)
        }}
      >
        <DialogTitle>Free Form: Education</DialogTitle>
        <DialogContent>
        <TextField
          label="Type Here"
          fullWidth
          multiline
          rows={20} // Set the height of the text box (more rows will make it taller)
          variant="outlined"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          sx={{
            width: '550px', // This ensures it spans the full width of the container
            height: 'auto',
            maxHeight: '1000px',

          }}
        />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CollapsibleTable;
