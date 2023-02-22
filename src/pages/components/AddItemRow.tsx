import React, { FunctionComponent, useRef } from 'react'
import { ReceiptEntity, receiptsRef } from '../../functions/firebase'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Box from '@mui/material/Box'
import { Button, TextField } from '@mui/material'

const AddItemRow: FunctionComponent<{ receipt: ReceiptEntity }> = ({ receipt }) => {
  const nameFieldRef = useRef<HTMLInputElement | null>()
  const costFieldRef = useRef<HTMLInputElement | null>()
  const quantityFieldRef = useRef<HTMLInputElement | null>()

  const onSubmit = () => {
    if (!nameFieldRef.current || !costFieldRef.current || !quantityFieldRef.current) return

    const name = nameFieldRef.current.value
    const costString = costFieldRef.current.value
    const quantityString = quantityFieldRef.current.value

    if (!name || !costString || !quantityString) return

    const cost = parseFloat(costString)
    const quantity = parseInt(quantityString)

    if (!cost || !quantity) return

    receiptsRef.child(receipt.id).child('items').push({ name, cost, quantity })
    nameFieldRef.current?.focus()

    nameFieldRef.current.value = ''
    costFieldRef.current.value = ''
    quantityFieldRef.current.value = '1'
  }

  const handleOnKeyDown = (name: string) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === 'Enter') {
      console.log({ name, value: costFieldRef.current?.value })
      if (name === 'name') {
        costFieldRef.current?.focus()
      } else if (name === 'cost' || name === 'quantity') {
        onSubmit()
      }
    }
  }

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      event.target.setSelectionRange(0, event.target.value.length)
    }, 100)
  }

  return (
    <TableRow>
      <TableCell colSpan={100}>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <TextField
            label={'Name'}
            variant='standard'
            sx={{ flex: 2 }}
            inputRef={nameFieldRef}
            onKeyDown={handleOnKeyDown('name')}
            onFocus={handleFocus}
          />
          <TextField
            label={'Qty'}
            variant='standard'
            sx={{ flex: 1 }}
            inputRef={quantityFieldRef}
            onKeyDown={handleOnKeyDown('quantity')}
            onFocus={handleFocus}
            defaultValue={1}
          />
          <TextField
            label={'Cost'}
            variant='standard'
            sx={{ flex: 1 }}
            inputRef={costFieldRef}
            onKeyDown={handleOnKeyDown('cost')}
            onFocus={handleFocus}
          />
          <Button variant={'contained'} sx={{ width: '100px' }} onClick={onSubmit}>
            Add
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  )
}

export default AddItemRow;