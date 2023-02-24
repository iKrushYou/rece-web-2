import React, { FunctionComponent, useMemo } from 'react';
import { pushReceipt, ReceiptEntity, useGetReceipts } from '../functions/firebase';
import { DateTime } from 'luxon';
import { Routes } from '../core/BaseRouter';
import UnstyledLink from '../components/UnstyledLink';
import { Container, Fab, ListItemButton, ListItemText } from '@mui/material';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import LoadingContainer from '../components/LoadingContainer';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import useEditTextModal from '../components/useEditTextModal';
import { useHistory } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import currency from 'currency.js';

const ReceiptsPage: FunctionComponent = () => {
  const history = useHistory();
  const { receipts, isLoading } = useGetReceipts();

  const receiptsSorted = useMemo(() => receipts.sort((a, b) => b.date - a.date), [receipts]);

  const { EditTextModal, showEditTextModal } = useEditTextModal();

  const handleCreateReceipt = async (title: string) => {
    const receiptId = await pushReceipt({ title }).key;
    if (!receiptId) {
      alert('There was an error creating new receipt');
      return;
    }
    history.push(Routes.receipts.info.route({ receiptId }));
  };

  return (
    <Container maxWidth={'xs'}>
      <LoadingContainer isLoading={isLoading}>
        <Box
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <Typography variant={'h3'} sx={{ mb: 2 }}>
            Receipts
          </Typography>
          <Paper>
            <List>
              {receiptsSorted.map((receipt) => (
                <ReceiptInfoRow key={receipt.id} receipt={receipt} />
              ))}
            </List>
          </Paper>
        </Box>
      </LoadingContainer>
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: '40px', right: '40px' }}
        onClick={() => showEditTextModal({ value: '', setValue: handleCreateReceipt, title: 'Create New Receipt' })}
      >
        <AddIcon />
      </Fab>
      {EditTextModal}
    </Container>
  );
};

export default ReceiptsPage;

const ReceiptInfoRow: FunctionComponent<{ receipt: ReceiptEntity }> = ({ receipt }) => {
  const dt = DateTime.fromMillis(receipt.date);
  return (
    <UnstyledLink to={Routes.receipts.info.route({ receiptId: receipt.id })}>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary={receipt.title} secondary={dt.toLocaleString(DateTime.DATE_MED)} />
          <Typography>{currency(receipt.total).format()}</Typography>
        </ListItemButton>
      </ListItem>
      <Divider />
    </UnstyledLink>
  );
};
