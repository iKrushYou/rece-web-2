import Box from '@mui/material/Box';
import { Avatar, Checkbox, Container, Fab, IconButton, ListItemText, ListSubheader, styled, useTheme } from '@mui/material';
import Table from '@mui/material/Table';
import React, { FunctionComponent } from 'react';
import useEditTextModal from '../components/useEditTextModal';
import {
  getItemQuantityForPerson,
  getPersonCountForItem,
  PersonEntity,
  receiptsRef,
  updateChargeValue,
  updateChargeValueByPct,
  updateReceiptItemValue,
  useGetReceipt,
} from '../functions/firebase';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableCellButton from './components/TableCellButton';
import currency from 'currency.js';
import RemoveIcon from '@mui/icons-material/Remove';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import useAddItemModal from './components/UseAddItemModal';
import SpacerRow from './components/SpacerRow';
import { useParams } from 'react-router-dom';
import { ReceiptInfoPathProps } from '../core/BaseRouter';
import clsx from 'clsx';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { nameToInitials } from '../functions/utils';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import ListItem from '@mui/material/ListItem';

const highlightedRowColor = `#fff8d6`;

const StyledTable = styled(Table)(({ theme }) => ({
  whiteSpace: 'nowrap',
  // backgroundColor: "white",
  position: 'relative',
  '& th': {
    position: 'sticky',
    top: 0,
  },
  '.sticky-column': {
    position: 'sticky',
    zIndex: 3,
    left: 0,
  },
  '.sticky-column-bg': {
    backgroundColor: theme.palette.background.paper,
  },
  '.sticky-header': {
    position: 'sticky',
    zIndex: 2,
    top: 0,
  },
  '& td': {
    whiteSpace: 'nowrap',
    paddingTop: '8px',
    paddingBottom: '8px',
  },
}));

const getVenmoPaymentLink = ({
  txn = 'charge',
  user = '',
  amount,
  note = 'Split by Rece',
}: {
  txn?: 'pay' | 'charge';
  user?: string;
  amount: number;
  note?: string;
}) => `venmo://paycharge?txn=${txn}&recipients=${user}&amount=${amount}&note=${note}`;

const ReceiptInfoItemsTab: FunctionComponent = () => {
  const { receiptId } = useParams<ReceiptInfoPathProps>();

  const theme = useTheme();

  const { EditTextModal, showEditTextModal } = useEditTextModal();

  const { receipt, items, subTotal, total, people, setPersonItemQuantity, personSubTotalMap, getChargeForPerson, getTotalForPerson } =
    useGetReceipt(receiptId);

  const { showAddItemModal, AddItemModal } = useAddItemModal({ receipt });

  const removeItem = async (itemId: string) => {
    if (!confirm("Are you sure you'd like to remove this item?")) return;
    if (!receipt || !itemId) return;
    await receiptsRef.child(receipt.id).child('items').child(itemId).remove();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <TableContainer component={Paper} sx={{ alignSelf: 'center' }}>
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell className={clsx('sticky-column', 'sticky-column-bg')}>{'Item'}</TableCell>
              <TableCell align={'right'} width={'1%'}>
                {'Quantity'}
              </TableCell>
              <TableCell align={'right'} width={'1%'}>
                {'Cost'}
              </TableCell>
              {people &&
                Object.values(people).map((person) => (
                  <TableCell key={person.id} align={'center'} width={'1%'} sx={{ minWidth: '100px' }} className={'sticky-header'}>
                    {person.name}
                  </TableCell>
                ))}
              <TableCell width={'1%'} />
            </TableRow>
          </TableHead>
          <TableBody>
            {items && items.length > 0 ? (
              Object.values(items).map((item) => {
                const isItemFull = getPersonCountForItem(receipt, item.id) >= item.quantity;

                return (
                  <TableRow
                    key={item.id}
                    sx={{
                      backgroundColor: !isItemFull ? highlightedRowColor : undefined,
                    }}
                  >
                    <TableCellButton
                      onClick={() =>
                        showEditTextModal({
                          setValue: (value) => updateReceiptItemValue(receiptId, item.id, 'name', value),
                          title: 'Edit Item Name',
                          value: item.name,
                        })
                      }
                      className={clsx('sticky-column')}
                      sx={{
                        backgroundColor: !isItemFull ? `${highlightedRowColor}` : 'white',
                      }}
                    >
                      {item.name}
                    </TableCellButton>
                    <TableCellButton
                      align={'right'}
                      onClick={() =>
                        showEditTextModal({
                          setValue: (value) => updateReceiptItemValue(receiptId, item.id, 'quantity', value),
                          title: 'Edit Item Quantity',
                          value: String(item.quantity),
                        })
                      }
                    >
                      {item.quantity}
                    </TableCellButton>
                    <TableCellButton
                      align={'right'}
                      onClick={() =>
                        showEditTextModal({
                          setValue: (value) => updateReceiptItemValue(receiptId, item.id, 'cost', value),
                          title: 'Edit Item Cost',
                          value: String(item.cost),
                        })
                      }
                    >
                      {currency(item.cost).format()}
                    </TableCellButton>
                    {people &&
                      Object.values(people).map((person) => {
                        const personItemQuantity = getItemQuantityForPerson(receipt, person.id, item.id);

                        return (
                          <TableCell key={person.id} align={'center'}>
                            {item.quantity > 1 ? (
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <IconButton
                                  size={'small'}
                                  onClick={() => setPersonItemQuantity(person.id, item.id, personItemQuantity - 1)}
                                  disabled={personItemQuantity <= 0}
                                  style={{
                                    opacity: personItemQuantity <= 0 ? 0.5 : undefined,
                                  }}
                                >
                                  <RemoveIcon />
                                </IconButton>
                                <Typography
                                  sx={
                                    personItemQuantity > 0
                                      ? {
                                          bgcolor: theme.palette.primary.main,
                                          color: 'white',
                                          px: '6px',
                                          mx: '-2px',
                                          borderRadius: '4px',
                                        }
                                      : undefined
                                  }
                                >
                                  {JSON.stringify(personItemQuantity)}
                                </Typography>
                                <IconButton
                                  size={'small'}
                                  onClick={() => setPersonItemQuantity(person.id, item.id, personItemQuantity + 1)}
                                  disabled={isItemFull}
                                  style={{
                                    opacity: isItemFull ? 0.5 : undefined,
                                  }}
                                >
                                  <AddIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Checkbox
                                checked={personItemQuantity > 0}
                                onChange={(event) => setPersonItemQuantity(person.id, item.id, event.target.checked ? 1 : 0)}
                                sx={{
                                  margin: '-9px',
                                  '& .MuiSvgIcon-root': { fontSize: 28 },
                                }}
                              />
                            )}
                          </TableCell>
                        );
                      })}
                    <TableCell align="right">
                      <IconButton
                        size={'small'}
                        edge="end"
                        onClick={() => removeItem(item.id)}
                        sx={{
                          margin: '-8px',
                        }}
                      >
                        <DeleteIcon color={'error'} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={100}>
                  <Typography sx={{ textAlign: 'center', p: '20px' }}>There aren't any items added to this receipt yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </StyledTable>
      </TableContainer>
      <Container maxWidth={'sm'} disableGutters>
        <Box component={Paper}>
          <StyledTable sx={{ width: '100%' }}>
            <TableBody>
              <TableRow>
                <TableCell className={clsx('sticky-column', 'sticky-column-bg')} sx={{ width: '30%' }}>
                  Sub Total
                </TableCell>
                <TableCell sx={{ width: '35%' }} />
                <TableCell align={'right'} sx={{ width: '35%' }}>
                  {currency(subTotal).format()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={clsx('sticky-column', 'sticky-column-bg')}>Tax</TableCell>
                <TableCellButton
                  align={'right'}
                  onClick={() =>
                    showEditTextModal({
                      setValue: (value) => updateChargeValueByPct(receiptId, 'taxCost', value, subTotal),
                      title: 'Edit Tax Percentage',
                      value: String(((currency(receipt.taxCost).value / currency(subTotal > 0 ? subTotal : 1).value) * 100.0).toFixed(3)),
                    })
                  }
                >
                  {((currency(receipt.taxCost).value / currency(subTotal > 0 ? subTotal : 1).value) * 100.0).toFixed(3)}%
                </TableCellButton>
                <TableCellButton
                  align={'right'}
                  onClick={() =>
                    showEditTextModal({
                      setValue: (value) => updateChargeValue(receiptId, 'taxCost', value),
                      title: 'Edit Tax',
                      value: String(receipt.taxCost),
                    })
                  }
                >
                  {currency(receipt.taxCost).format()}
                </TableCellButton>
              </TableRow>
              <TableRow>
                <TableCell className={clsx('sticky-column', 'sticky-column-bg')}>Tip</TableCell>
                <TableCellButton
                  align={'right'}
                  onClick={() =>
                    showEditTextModal({
                      setValue: (value) => updateChargeValueByPct(receiptId, 'tipCost', value, subTotal),
                      title: 'Edit Tip Percentage',
                      value: String(((currency(receipt.tipCost).value / currency(subTotal > 0 ? subTotal : 1).value) * 100.0).toFixed(3)),
                    })
                  }
                >
                  {((currency(receipt.tipCost).value / currency(subTotal > 0 ? subTotal : 1).value) * 100.0).toFixed(3)}%
                </TableCellButton>
                <TableCellButton
                  align={'right'}
                  onClick={() =>
                    showEditTextModal({
                      setValue: (value) => updateChargeValue(receiptId, 'tipCost', value),
                      title: 'Edit Tip',
                      value: String(receipt.tipCost),
                    })
                  }
                >
                  {currency(receipt.tipCost).format()}
                </TableCellButton>
              </TableRow>
              <SpacerRow />
              <TableRow>
                <TableCell className={clsx('sticky-column', 'sticky-column-bg')}>Total</TableCell>
                <TableCell />
                <TableCell align={'right'}>{currency(total).format()}</TableCell>
              </TableRow>
            </TableBody>
          </StyledTable>
        </Box>
      </Container>
      <Container maxWidth={'sm'} disableGutters>
        <Paper>
          <List
            sx={{ width: '100%', bgcolor: 'background.paper' }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
              <ListSubheader component="div" id="nested-list-subheader">
                Individual Totals
              </ListSubheader>
            }
          >
            {people.map((person) => (
              <PersonTotalListItem person={person} key={person.id} receiptId={receiptId} />
            ))}
          </List>
        </Paper>
      </Container>
      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: '40px', right: '40px' }} onClick={() => showAddItemModal()}>
        <AddIcon />
      </Fab>
      {EditTextModal}
      {AddItemModal}
    </Box>
  );
};

const PersonTotalListItem: FunctionComponent<{ person: PersonEntity; receiptId: string }> = ({ person, receiptId }) => {
  const { receipt, items, subTotal, total, people, setPersonItemQuantity, personSubTotalMap, getChargeForPerson, getTotalForPerson } =
    useGetReceipt(receiptId);

  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <React.Fragment key={person.id}>
      <ListItemButton onClick={handleClick}>
        <ListItemAvatar>
          <Avatar>{nameToInitials(person.name)}</Avatar>
        </ListItemAvatar>
        <ListItemText primary={person.name} secondary={currency(getTotalForPerson(person.id)).format()} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem sx={{ pl: 4, display: 'flex' }}>
            <Typography sx={{ flex: 1 }}>Sub Total</Typography>
            <Typography>{currency(personSubTotalMap[person.id]).format()}</Typography>
          </ListItem>
          <ListItem sx={{ pl: 4, display: 'flex' }}>
            <Typography sx={{ flex: 1 }}>Tax</Typography>
            <Typography>{currency(getChargeForPerson('taxCost', person.id)).format()}</Typography>
          </ListItem>
          <ListItem sx={{ pl: 4, display: 'flex' }}>
            <Typography sx={{ flex: 1 }}>Tip</Typography>
            <Typography>{currency(getChargeForPerson('tipCost', person.id)).format()}</Typography>
          </ListItem>
        </List>
      </Collapse>
    </React.Fragment>
  );
};

export default ReceiptInfoItemsTab;
