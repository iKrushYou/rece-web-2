import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import { ReceiptInfoPathProps } from '../core/BaseRouter';
import useEditTextModal from '../components/useEditTextModal';
import { receiptsRef, updatePerson, useGetReceipt } from '../functions/firebase';
import React, { useRef } from 'react';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Avatar, Button, ButtonBase, IconButton, TextField } from '@mui/material';
import { nameToInitials } from '../functions/utils';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

const ReceiptInfoPeopleTab = () => {
  const { receiptId } = useParams<ReceiptInfoPathProps>();

  const { EditTextModal, showEditTextModal } = useEditTextModal();

  const { receipt, people } = useGetReceipt(receiptId);

  const newPersonFieldRef = useRef<HTMLInputElement>();

  const addPerson = async (name: string) => {
    if (!name) return;
    receiptsRef.child(receipt.id).child('people').push({ name });
  };

  const removePerson = async (personId: string) => {
    if (!confirm("Are you sure you'd like to remove this person?")) return;
    if (!receipt || !personId) return;
    await receiptsRef.child(receipt.id).child('people').child(personId).remove();
  };

  const handleAddPerson = async () => {
    if (!newPersonFieldRef.current) return;
    const newPersonName = newPersonFieldRef.current.value;
    if (!newPersonName) return;
    await addPerson(newPersonName);
    newPersonFieldRef.current.value = '';
  };

  const handleOnKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === 'Enter') {
      await handleAddPerson();
    }
  };

  return (
    // <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

    <Container maxWidth={'xs'} disableGutters>
      <Paper>
        <List>
          {people.map((person) => (
            <ListItem key={person.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <ListItemAvatar>
                  <Avatar>{nameToInitials(person.name)}</Avatar>
                </ListItemAvatar>
                <ButtonBase
                  sx={{ width: '100%', textAlign: 'inherit' }}
                  onClick={() => {
                    showEditTextModal({
                      title: 'Edit Person',
                      value: person.name,
                      setValue: (value) => updatePerson(receipt, { ...person, name: value }),
                    });
                  }}
                  disabled={!!receipt.locked}
                >
                  <Typography variant={'h5'} sx={{ flex: 1 }}>
                    {person.name}
                  </Typography>
                </ButtonBase>
                <IconButton size={'small'} edge="end" onClick={() => removePerson(person.id)} disabled={!!receipt.locked}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
          {!receipt.locked && (
            <ListItem>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <ListItemAvatar></ListItemAvatar>
                <TextField
                  variant={'standard'}
                  inputRef={newPersonFieldRef}
                  onKeyDown={handleOnKeyDown}
                  placeholder={'Add Person'}
                  autoFocus
                />
                <Button onClick={handleAddPerson}>Add</Button>
              </Box>
            </ListItem>
          )}
        </List>
      </Paper>
      {EditTextModal}
    </Container>
  );
};

export default ReceiptInfoPeopleTab;
