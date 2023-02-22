import Box from '@mui/material/Box';
import { Checkbox, IconButton, styled, useTheme } from '@mui/material';
import Table from '@mui/material/Table';
import React, { FunctionComponent } from 'react';
import useEditTextModal from '../components/useEditTextModal';
import {
  getItemQuantityForPerson,
  getPersonCountForItem,
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
import AddItemRow from './components/AddItemRow';
import SpacerRow from './components/SpacerRow';
import { amber } from '@mui/material/colors';
import { useParams } from 'react-router-dom';
import { ReceiptInfoPathProps } from '../core/BaseRouter';

const warningBgColor = `${amber[100]}80`;

const StyledTable = styled(Table)(() => ({
  whiteSpace: 'nowrap',
  // backgroundColor: "white",
  position: 'relative',
  '& th': {
    position: 'sticky',
    top: 0,
  },
  '.sticky-column': {
    position: 'sticky',
    backgroundColor: 'white',
    zIndex: 1,
    left: 0,
  },
  '.sticky-header': {
    position: 'sticky',
    backgroundColor: 'white',
    zIndex: 1,
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

  const {
    receipt,
    items,
    subTotal,
    total,
    people,
    setPersonItemQuantity,
    personSubTotalMap,
    getChargeForPerson,
    getTotalForPerson,
  } =
    useGetReceipt(receiptId);

  const removeItem = async (itemId: string) => {
    if (!confirm('Are you sure you\'d like to remove this item?')) return;
    if (!receipt || !itemId) return;
    await receiptsRef.child(receipt.id).child('items').child(itemId).remove();
  };

  return (
    <>
      <TableContainer component={Paper}>
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell>{'Item'}</TableCell>
              <TableCell align={'right'} width={'1%'}>
                {'Quantity'}
              </TableCell>
              <TableCell align={'right'} width={'1%'}>
                {'Cost'}
              </TableCell>
              {people &&
                Object.values(people).map((person) => (
                  <TableCell key={person.id} align={'center'} width={'1%'} sx={{ minWidth: '100px' }}
                             className={'sticky-header'}>
                    {person.name}
                  </TableCell>
                ))}
              <TableCell width={'1%'} />
            </TableRow>
          </TableHead>
          <TableBody>
            {items &&
              Object.values(items).map((item) => {
                const isItemFull = getPersonCountForItem(receipt, item.id) >= item.quantity;

                return (
                  <TableRow
                    key={item.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: !isItemFull ? warningBgColor : undefined,
                    }}
                  >
                    <TableCellButton
                      component='th'
                      scope='row'
                      onClick={() =>
                        showEditTextModal({
                          setValue: (value) => updateReceiptItemValue(receiptId, item.id, 'name', value),
                          title: 'Edit Item Name',
                          value: item.name,
                        })
                      }
                      className={'sticky-column'}
                    >
                      {item.name}
                    </TableCellButton>
                    <TableCellButton
                      component='th'
                      scope='row'
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
                      component='th'
                      scope='row'
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
                                <Typography sx={personItemQuantity > 0 ? {
                                  bgcolor: theme.palette.primary.main,
                                  color: 'white',
                                  px: '6px',
                                  mx: '-2px',
                                  borderRadius: '4px',
                                } : undefined}>{JSON.stringify(personItemQuantity)}</Typography>
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
                    <TableCell align='right'>
                      <IconButton
                        size={'small'}
                        edge='end'
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
              })}
            <AddItemRow receipt={receipt} />
            <SpacerRow />
            <TableRow>
              <TableCell className={'sticky-column'} />
              <TableCell colSpan={2} />
              {people &&
                Object.values(people).map((person) => (
                  <TableCell key={person.id} align={'right'} sx={{ position: 'sticky', top: 0 }}>
                    {person.name}
                  </TableCell>
                ))}
            </TableRow>
            <TableRow>
              <TableCell className={'sticky-column'}>Sub Total</TableCell>
              <TableCell />
              <TableCell align={'right'}>{currency(subTotal).format()}</TableCell>
              {people.map((person) => (
                <TableCell key={person.id} align={'right'}>
                  {currency(personSubTotalMap[person.id]).format()}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className={'sticky-column'}>Tax</TableCell>
              <TableCellButton
                component='th'
                scope='row'
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
                component='th'
                scope='row'
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
              {people.map((person) => (
                <TableCell key={person.id} align={'right'}>
                  {currency(getChargeForPerson('taxCost', person.id)).format()}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className={'sticky-column'}>Tip</TableCell>
              <TableCellButton
                component='th'
                scope='row'
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
                component='th'
                scope='row'
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
              {people.map((person) => (
                <TableCell key={person.id} align={'right'}>
                  {currency(getChargeForPerson('tipCost', person.id)).format()}
                </TableCell>
              ))}
            </TableRow>
            <SpacerRow />
            <TableRow>
              <TableCell className={'sticky-column'}>Total</TableCell>
              <TableCell />
              <TableCell align={'right'}>{currency(total).format()}</TableCell>
              {people.map((person) => (
                <TableCell key={person.id} align={'right'}>
                  {currency(getTotalForPerson(person.id)).format()}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </StyledTable>
      </TableContainer>
      {EditTextModal}
    </>
  );
};

export default ReceiptInfoItemsTab;
