import Box from '@mui/material/Box';
import { Avatar, ButtonBase, Checkbox, Container, Fab, IconButton, ListItemText, styled, useTheme } from '@mui/material';
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
  updatePerson,
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
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListItem from '@mui/material/ListItem';
import VenmoLogo from './venmo-logo.png';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';

const StyledTable = styled(Table)(() => ({
  // backgroundColor: "white",
  position: 'relative',
  '.sticky-column': {
    position: 'sticky',
    zIndex: 1,
    left: 0,
  },
  // '.sticky-column-bg': {
  //   backgroundColor: '#1e1e1e',
  // },
  // '.sticky-header': {
  //   position: 'sticky',
  //   zIndex: 2,
  //   top: 0,
  // },
  '& td': {
    whiteSpace: 'nowrap',
    paddingTop: '8px',
    paddingBottom: '8px',
    // backgroundColor: theme.palette.tableBg,
  },
  '& th': {
    // whiteSpace: 'nowrap',
    paddingTop: '8px',
    paddingBottom: '8px',
    // backgroundColor: theme.palette.tableBg,
  },
}));

const getVenmoPaymentLink = ({
  txn = 'charge',
  user = '',
  amount,
  note = `Split by Rece`,
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

  const { receipt, items, subTotal, total, people, setPersonItemQuantity } = useGetReceipt(receiptId);

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
              <TableCell
                className={clsx('sticky-column', 'sticky-column-bg')}
                sx={{ backgroundColor: theme.palette.tableBg }}
                width={'100px'}
              >
                {'Item'}
              </TableCell>
              <TableCell align={'right'} width={'1%'}>
                {'Quantity'}
              </TableCell>
              <TableCell align={'right'} width={'1%'}>
                {'Cost'}
              </TableCell>
              {people &&
                Object.values(people).map((person) => (
                  <TableCell key={person.id} align={'center'} width={'1%'} sx={{ minWidth: '100px' }}>
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
                      backgroundColor: !isItemFull ? theme.palette.highlightedRowBg : theme.palette.tableBg,
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
                      disabled={!!receipt.locked}
                      className={clsx('sticky-column', 'sticky-column-bg')}
                      sx={{
                        maxWidth: '160px',
                        overflowX: 'hidden',
                        textOverflow: 'ellipsis',
                        backgroundColor: !isItemFull ? theme.palette.highlightedRowBg : theme.palette.tableBg,
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
                      disabled={!!receipt.locked}
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
                      disabled={!!receipt.locked}
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
                                  disabled={personItemQuantity <= 0 || !!receipt.locked}
                                  style={{
                                    opacity: personItemQuantity <= 0 || !!receipt.locked ? 0.5 : undefined,
                                  }}
                                >
                                  <RemoveIcon />
                                </IconButton>
                                <Typography
                                  sx={{
                                    bgcolor:
                                      personItemQuantity > 0
                                        ? !receipt.locked
                                          ? theme.palette.primary.main
                                          : theme.palette.grey[600]
                                        : undefined,
                                    borderColor: !receipt.locked ? theme.palette.grey[300] : theme.palette.grey[600],
                                    borderWidth: personItemQuantity <= 0 ? 2 : 0,
                                    borderStyle: 'solid',
                                    color: theme.palette.primary.contrastText,
                                    // px: '6px',
                                    mx: '-2px',
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '2px',
                                  }}
                                >
                                  {personItemQuantity > 0 ? personItemQuantity : ''}
                                </Typography>
                                <IconButton
                                  size={'small'}
                                  onClick={() => setPersonItemQuantity(person.id, item.id, personItemQuantity + 1)}
                                  disabled={isItemFull || !!receipt.locked}
                                  style={{
                                    opacity: isItemFull || !!receipt.locked ? 0.5 : undefined,
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
                                disabled={!!receipt.locked}
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
                        disabled={!!receipt.locked}
                      >
                        <DeleteIcon />
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
      <Container maxWidth={'xs'} disableGutters>
        <Paper sx={{ overflow: 'hidden' }}>
          <StyledTable sx={{ width: '100%' }}>
            <TableBody>
              <TableRow>
                <TableCell sx={{ width: '30%' }}>
                  <b>Sub Total</b>
                </TableCell>
                <TableCell sx={{ width: '35%' }} />
                <TableCell align={'right'} sx={{ width: '35%' }}>
                  {currency(subTotal).format()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>Tax</b>
                </TableCell>
                <TableCellButton
                  align={'right'}
                  onClick={() =>
                    showEditTextModal({
                      setValue: (value) => updateChargeValueByPct(receiptId, 'taxCost', value, subTotal),
                      title: 'Edit Tax Percentage',
                      value: String(((currency(receipt.taxCost).value / currency(subTotal > 0 ? subTotal : 1).value) * 100.0).toFixed(3)),
                    })
                  }
                  disabled={!!receipt.locked}
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
                  disabled={!!receipt.locked}
                >
                  {currency(receipt.taxCost).format()}
                </TableCellButton>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>Tip</b>
                </TableCell>
                <TableCellButton
                  align={'right'}
                  onClick={() =>
                    showEditTextModal({
                      setValue: (value) => updateChargeValueByPct(receiptId, 'tipCost', value, subTotal),
                      title: 'Edit Tip Percentage',
                      value: String(((currency(receipt.tipCost).value / currency(subTotal > 0 ? subTotal : 1).value) * 100.0).toFixed(3)),
                    })
                  }
                  disabled={!!receipt.locked}
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
                  disabled={!!receipt.locked}
                >
                  {currency(receipt.tipCost).format()}
                </TableCellButton>
              </TableRow>
              {/* {receipt.fees?.map((fee) => ( */}
              {/*   <TableRow key={fee.name}> */}
              {/*     <TableCellButton */}
              {/*       onClick={() => */}
              {/*         showEditTextModal({ */}
              {/*           setValue: (value) => updateReceiptFee(receipt, value, fee.amount), */}
              {/*           title: 'Edit Fee Name', */}
              {/*           value: fee.name, */}
              {/*         }) */}
              {/*       } */}
              {/*       disabled={!!receipt.locked} */}
              {/*     > */}
              {/*       <b>{fee.name}</b> */}
              {/*     </TableCellButton> */}
              {/*     <TableCellButton */}
              {/*       align={'right'} */}
              {/*       onClick={() => */}
              {/*         showEditTextModal({ */}
              {/*           setValue: (value) => */}
              {/*             updateReceiptFee( */}
              {/*               receipt, */}
              {/*               fee.name, */}
              {/*               ((currency(fee.amount).value / currency(subTotal > 0 ? subTotal : 1).value) * 100.0).toFixed(3), */}
              {/*             ), */}
              {/*           title: 'Edit Fee Percentage', */}
              {/*           value: ((currency(fee.amount).value / currency(subTotal > 0 ? subTotal : 1).value) * 100.0).toFixed(3), */}
              {/*         }) */}
              {/*       } */}
              {/*       disabled={!!receipt.locked} */}
              {/*     > */}
              {/*       {((currency(fee.amount).value / currency(subTotal > 0 ? subTotal : 1).value) * 100.0).toFixed(3)}% */}
              {/*     </TableCellButton> */}
              {/*     <TableCellButton */}
              {/*       align={'right'} */}
              {/*       onClick={() => */}
              {/*         showEditTextModal({ */}
              {/*           setValue: (value) => updateReceiptFee(receipt, fee.name, currency(value).value), */}
              {/*           title: 'Edit Fee Amount', */}
              {/*           value: String(fee.amount), */}
              {/*         }) */}
              {/*       } */}
              {/*       disabled={!!receipt.locked} */}
              {/*     > */}
              {/*       {currency(fee.amount).format()} */}
              {/*     </TableCellButton> */}
              {/*   </TableRow> */}
              {/* ))} */}
              {/* <TableRow> */}
              {/*   <TableCell colSpan={100}> */}
              {/*     <Button sx={{ m: '-8px' }} onClick={() => updateReceiptFee(receipt, `Fee ${(receipt.fees?.length ?? 0) + 1}`, 0)}> */}
              {/*       Add Fee */}
              {/*     </Button> */}
              {/*   </TableCell> */}
              {/* </TableRow> */}
              <SpacerRow />
              <TableRow>
                <TableCell className={clsx('sticky-column', 'sticky-column-bg')}>
                  <b>Total</b>
                </TableCell>
                <TableCell />
                <TableCell align={'right'}>
                  <b>{currency(total).format()}</b>
                </TableCell>
              </TableRow>
            </TableBody>
          </StyledTable>
        </Paper>
      </Container>
      <Container maxWidth={'xs'} disableGutters>
        <Paper sx={{ borderRadius: '4px', overflow: 'hidden' }}>
          <List sx={{ py: 0 }}>
            {people.map((person) => (
              <PersonTotalListItem person={person} key={person.id} receiptId={receiptId} />
            ))}
          </List>
        </Paper>
      </Container>
      {!receipt.locked && (
        <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: '40px', right: '40px' }} onClick={() => showAddItemModal()}>
          <AddIcon />
        </Fab>
      )}
      {EditTextModal}
      {AddItemModal}
    </Box>
  );
};

const PersonTotalListItem: FunctionComponent<{ person: PersonEntity; receiptId: string }> = ({ person, receiptId }) => {
  const { receipt, items, personSubTotalMap, getItemCostForPerson, getChargeForPerson, getTotalForPerson } = useGetReceipt(receiptId);

  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <React.Fragment key={person.id}>
      <ListItemButton onClick={handleClick}>
        <Checkbox
          sx={{ mr: '16px' }}
          checked={person.paid}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={async (e) => {
            e.stopPropagation();
            await updatePerson(receipt, { ...person, paid: !person.paid });
          }}
        />
        <ListItemAvatar>
          <Avatar>{nameToInitials(person.name)}</Avatar>
        </ListItemAvatar>
        <ListItemText primary={person.name} secondary={currency(getTotalForPerson(person.id)).format()} />
        {person.paid ? (
          <Button color={'error'} variant={'outlined'} disableRipple sx={{ mr: '10px' }}>
            PAID
          </Button>
        ) : (
          <ButtonBase
            sx={{ p: '8px', borderRadius: '8px', mr: '16px' }}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = getVenmoPaymentLink({
                amount: getTotalForPerson(person.id),
                note: `${receipt.title} - Split by Rece`,
              });
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <img src={VenmoLogo} width={40} height={40} alt={'Venmo logo'} />
          </ButtonBase>
        )}
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {Object.values(items ?? {})
            .filter((item) => getItemQuantityForPerson(receipt, person.id, item.id) > 0)
            .map((item) => {
              const showItemCount = getItemCostForPerson(person.id, item.id).totalShares > getItemCostForPerson(person.id, item.id).shares;
              return (
                <ListItem key={item.id} sx={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Typography sx={{ flex: 1 }}>
                    {item.name}
                    {showItemCount &&
                      ` [${getItemCostForPerson(person.id, item.id).shares}/${getItemCostForPerson(person.id, item.id).totalShares}]`}
                  </Typography>
                  <Typography>{currency(getItemCostForPerson(person.id, item.id).subTotal).format()}</Typography>
                </ListItem>
              );
            })}
          <Divider sx={{ mx: 2 }} />
          <ListItem sx={{ display: 'flex' }}>
            <Typography sx={{ flex: 1 }}>Sub Total</Typography>
            <Typography>{currency((personSubTotalMap[person.id] ?? {}).subTotal).format()}</Typography>
          </ListItem>
          <ListItem sx={{ display: 'flex' }}>
            <Typography sx={{ flex: 1 }}>Tax</Typography>
            <Typography>{currency(getChargeForPerson('taxCost', person.id)).format()}</Typography>
          </ListItem>
          <ListItem sx={{ display: 'flex' }}>
            <Typography sx={{ flex: 1 }}>Tip</Typography>
            <Typography>{currency(getChargeForPerson('tipCost', person.id)).format()}</Typography>
          </ListItem>
        </List>
      </Collapse>
      <Divider />
    </React.Fragment>
  );
};

export default ReceiptInfoItemsTab;
