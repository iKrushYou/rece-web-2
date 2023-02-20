import React, {FunctionComponent, PropsWithChildren, useEffect, useRef, useState} from "react";
import {useHistory, useParams} from "react-router";
import {ReceiptInfoTabPathProps} from "../core/BaseRouter";
import {
    getItemQuantityForPerson,
    getPersonCountForItem,
    updateReceiptItemValue,
    useGetReceipt
} from "../functions/firebase";
import {
    Button,
    ButtonBase,
    Card,
    CardContent,
    Checkbox,
    Container,
    IconButton,
    Modal,
    TextField,
    useTheme
} from "@mui/material";
import LoadingContainer from "../components/LoadingContainer";
import Typography from "@mui/material/Typography";
import {DateTime} from "luxon";
import Box from "@mui/material/Box";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import currency from "currency.js";
import {amber} from "@mui/material/colors";
import RemoveIcon from '@mui/icons-material/Remove'
import AddIcon from '@mui/icons-material/Add'
import {TableCellProps} from "@mui/material/TableCell/TableCell";

const warningBgColor = `${amber[100]}80`;

const ReceiptInfoPage: FunctionComponent = () => {
    const {receiptId, tab} = useParams<ReceiptInfoTabPathProps>();
    const history = useHistory();

    const {receipt, people, isLoading, subTotal} = useGetReceipt(receiptId);

    const dt = DateTime.fromMillis(receipt?.date ?? 0)

    return (
        <Container sx={{marginBottom: '50px'}}>
            <LoadingContainer isLoading={isLoading}>
                {receipt && (
                    <Box>
                        <Box sx={{marginBottom: '20px'}}>

                            <Typography variant={'h3'}>{receipt.title}</Typography>
                            <Typography>{dt.toLocaleString(DateTime.DATE_MED)}</Typography>
                        </Box>
                        <ReceiptTable receiptId={receiptId}/>
                    </Box>
                )}
            </LoadingContainer>
        </Container>
    )
}

export default ReceiptInfoPage;

const ReceiptTable: FunctionComponent<{ receiptId: string }> = ({receiptId}) => {

    const theme = useTheme()
    const {Modal: EditTextModal, showModal: showEditTextModal} = useEditTextModal();

    const {
        receipt,
        items,
        subTotal,
        total,
        people,
        setPersonItemQuantity,
        personSubTotalMap,
        getChargeForPerson,
        getTotalForPerson
    } =
        useGetReceipt(receiptId);

    const columnCount = 3 + Object.entries(people ?? {}).length

    return (
        <>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650, whiteSpace: 'nowrap'}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>{'Item Name'}</TableCell>
                            <TableCell align={'right'} width={'1%'}>{'Quantity'}</TableCell>
                            <TableCell align={'right'} width={'1%'}>{'Cost'}</TableCell>
                            {people && Object.values(people).map(person => (
                                <TableCell key={person.id} align={'center'} width={'1%'} sx={{minWidth: '100px'}}>
                                    {person.name}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items && Object.values(items).map((item) => {
                            const isItemFull = getPersonCountForItem(receipt, item.id) >= item.quantity;

                            return (
                                <TableRow
                                    key={item.id}
                                    sx={{
                                        '&:last-child td, &:last-child th': {border: 0},
                                        backgroundColor: !isItemFull ? warningBgColor : undefined
                                    }}
                                >
                                    <TableCellButton component="th" scope="row" onClick={() => showEditTextModal({
                                        setValue: (value) => updateReceiptItemValue(receiptId, item.id, 'name', value),
                                        title: 'Edit Item Name',
                                        value: item.name
                                    })}>
                                        {item.name}
                                    </TableCellButton>
                                    <TableCellButton component="th" scope="row" align={'right'}
                                                     onClick={() => showEditTextModal({
                                                         setValue: (value) => updateReceiptItemValue(receiptId, item.id, 'quantity', value),
                                                         title: 'Edit Item Quantity',
                                                         value: String(item.quantity)
                                                     })}>
                                        {item.quantity}
                                    </TableCellButton>
                                    <TableCellButton component="th" scope="row" align={'right'}
                                                     onClick={() => showEditTextModal({
                                                         setValue: (value) => updateReceiptItemValue(receiptId, item.id, 'cost', value),
                                                         title: 'Edit Item Cost',
                                                         value: String(item.cost)
                                                     })}>
                                        {currency(item.cost).format()}
                                    </TableCellButton>
                                    {people && Object.values(people).map(person => {
                                        const personItemQuantity = getItemQuantityForPerson(receipt, person.id, item.id);

                                        return (
                                            <TableCell key={person.id} align={'center'}>
                                                {item.quantity > 1 ? (
                                                    <Box sx={{
                                                        display: 'inline-flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}>
                                                        <IconButton
                                                            size={'small'}
                                                            onClick={() => setPersonItemQuantity(person.id, item.id, personItemQuantity - 1)}
                                                            disabled={personItemQuantity <= 0}
                                                            style={{
                                                                opacity: personItemQuantity <= 0 ? 0.5 : undefined,
                                                            }}
                                                        >
                                                            <RemoveIcon/>
                                                        </IconButton>
                                                        <Typography>{JSON.stringify(personItemQuantity)}</Typography>
                                                        <IconButton
                                                            size={'small'}
                                                            onClick={() => setPersonItemQuantity(person.id, item.id, personItemQuantity + 1)}
                                                            disabled={isItemFull}
                                                            style={{
                                                                opacity: isItemFull ? 0.5 : undefined,
                                                            }}
                                                        >
                                                            <AddIcon/>
                                                        </IconButton>
                                                    </Box>
                                                ) : (
                                                    <Checkbox
                                                        checked={personItemQuantity > 0}
                                                        onChange={(event) => setPersonItemQuantity(person.id, item.id, event.target.checked ? 1 : 0)}
                                                        sx={{margin: '-9px', '& .MuiSvgIcon-root': {fontSize: 28}}}
                                                    />
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                        <TableRow sx={{
                            backgroundColor: theme.palette.background.default,
                        }}>
                            <TableCell colSpan={columnCount}></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={3}></TableCell>
                            {people && Object.values(people).map(person => (
                                <TableCell key={person.id} align={'right'} sx={{position: 'sticky', top: 0}}>
                                    {person.name}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={2}>Sub Total</TableCell>
                            <TableCell align={'right'}>{currency(subTotal).format()}</TableCell>
                            {people.map(person => (
                                <TableCell align={'right'}>{currency(personSubTotalMap[person.id]).format()}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell>Tax</TableCell>
                            <TableCell
                                align={'right'}>{((currency(receipt.taxCost).value / currency(subTotal > 0 ? subTotal : 1).value) * 100.0).toFixed(3)}%</TableCell>
                            <TableCell align={'right'}>{currency(receipt.taxCost).format()}</TableCell>
                            {people.map(person => (
                                <TableCell
                                    align={'right'}>{currency(getChargeForPerson('taxCost', person.id)).format()}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            <TableCell>Tip</TableCell>
                            <TableCell
                                align={'right'}>{((currency(receipt.tipCost).value / currency(subTotal > 0 ? subTotal : 1).value) * 100.0).toFixed(3)}%</TableCell>
                            <TableCell align={'right'}>{currency(receipt.tipCost).format()}</TableCell>
                            {people.map(person => (
                                <TableCell
                                    align={'right'}>{currency(getChargeForPerson('tipCost', person.id)).format()}</TableCell>
                            ))}
                        </TableRow>
                        <TableRow sx={{backgroundColor: theme.palette.background.default}}>
                            <TableCell colSpan={columnCount}></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={2}>Total</TableCell>
                            <TableCell align={'right'}>{currency(total).format()}</TableCell>
                            {people.map(person => (
                                <TableCell align={'right'}>{currency(getTotalForPerson(person.id)).format()}</TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            {EditTextModal}
        </>
    );
}

type UseEditTextModalShowProps = { value: string; setValue: (value: string) => void; title: string }

const useEditTextModal = () => {
    const [state, setState] = useState<UseEditTextModalShowProps & { open: boolean }>({
        open: false,
        value: '',
        setValue: (value => {
        }),
        title: '',
    })

    const setOpen = (value: boolean) => {
        setState(prev => ({...prev, open: value}))
    }

    const showModal = ({value, setValue, title}: UseEditTextModalShowProps) => {
        setState({
            open: true,
            value, setValue, title
        })
    }

    const Modal = <EditTextModal open={state.open} handleClose={() => setOpen(false)} title={state.title}
                                 value={state.value} setValue={state.setValue}/>

    return {Modal, showModal};
}

const EditTextModal: FunctionComponent<{ open: boolean; handleClose: () => void } & UseEditTextModalShowProps> = ({
                                                                                                                      open,
                                                                                                                      handleClose,
                                                                                                                      title,
                                                                                                                      value,
                                                                                                                      setValue
                                                                                                                  }) => {
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 20px)',
        maxWidth: '600px',
        boxShadow: 24,
    };

    const fieldRef = useRef<HTMLInputElement>();
    const [fieldValue, setFieldValue] = useState('')

    useEffect(() => {
        if (open) {
            setFieldValue(value)
        } else {
            setFieldValue('')
        }
    }, [value, open])

    const handleSave = () => {
        setValue(fieldValue)
        handleClose()
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
        >
            <Card sx={style}>
                <CardContent>
                    <Typography variant="h6" component="h2" sx={{mb: '20px'}}>
                        {title}
                    </Typography>
                    <TextField variant={'standard'} value={fieldValue} onChange={e => setFieldValue(e.target.value)}
                               sx={{width: '100%'}} inputRef={fieldRef} autoFocus
                               onKeyDown={(event) => {
                                   if (['Enter'].includes(event.code)) {
                                       handleSave();
                                   }
                               }}
                    />
                    <Box sx={{display: 'flex', justifyContent: 'right', mt: '20px', gap: '10px'}}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button variant={'contained'} onClick={handleSave}>Save</Button>
                    </Box>
                </CardContent>
            </Card>
        </Modal>
    )
}

const TableCellButton: FunctionComponent<PropsWithChildren<TableCellProps>> = ({children, sx, ...otherProps}) => {
    return (
        <TableCell {...otherProps} sx={{...sx, position: 'relative'}}>
            <ButtonBase sx={{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0}}/>
            {children}
        </TableCell>
    )
}