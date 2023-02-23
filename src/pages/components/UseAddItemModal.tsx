import React, { useLayoutEffect, useRef, useState } from 'react';
import { ReceiptEntity, receiptsRef } from '../../functions/firebase';
import { Button, Card, CardContent, Modal, TextField } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'calc(100% - 20px)',
  maxWidth: '600px',
  boxShadow: 24,
};

const useAddItemModal = ({ receipt }: { receipt: ReceiptEntity }) => {
  const [open, setOpen] = useState(false);

  const showAddItemModal = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const nameFieldRef = useRef<HTMLInputElement | null>();
  const costFieldRef = useRef<HTMLInputElement | null>();
  const quantityFieldRef = useRef<HTMLInputElement | null>();

  const onSubmit = () => {
    if (!nameFieldRef.current || !costFieldRef.current || !quantityFieldRef.current) return;

    const name = nameFieldRef.current.value;
    const costString = costFieldRef.current.value;
    const quantityString = quantityFieldRef.current.value;

    if (!name || !costString || !quantityString) return;

    const cost = parseFloat(costString);
    const quantity = parseInt(quantityString);

    if (!cost || !quantity) return;

    receiptsRef.child(receipt.id).child('items').push({ name, cost, quantity });
    nameFieldRef.current?.focus();

    nameFieldRef.current.value = '';
    costFieldRef.current.value = '';
    quantityFieldRef.current.value = '1';
  };

  const handleOnKeyDown = (name: string) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === 'Enter') {
      if (name === 'name') {
        costFieldRef.current?.focus();
      } else if (name === 'cost' || name === 'quantity') {
        onSubmit();
      }
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      event.target.setSelectionRange(0, event.target.value.length);
    }, 100);
  };

  const AddItemModal = (
    <Modal open={open} onClose={handleClose}>
      <Card sx={style}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <TextField
                label={'Name'}
                variant="standard"
                sx={{ width: '100%' }}
                inputRef={nameFieldRef}
                onKeyDown={handleOnKeyDown('name')}
                onFocus={handleFocus}
                autoFocus
              />
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                label={'Qty'}
                variant="standard"
                sx={{ width: '100%' }}
                inputRef={quantityFieldRef}
                onKeyDown={handleOnKeyDown('quantity')}
                onFocus={handleFocus}
                defaultValue={1}
              />
            </Grid>
            <Grid xs={12} md={3}>
              <TextField
                label={'Cost'}
                variant="standard"
                sx={{ width: '100%' }}
                inputRef={costFieldRef}
                onKeyDown={handleOnKeyDown('cost')}
                onFocus={handleFocus}
              />
            </Grid>
          </Grid>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'right',
              mt: '20px',
              gap: '10px',
            }}
          >
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant={'contained'} onClick={onSubmit}>
              Save
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Modal>
  );

  return { AddItemModal, showAddItemModal };
};

export default useAddItemModal;
