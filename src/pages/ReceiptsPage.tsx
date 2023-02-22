import React, { FunctionComponent, useMemo } from 'react'
import { ReceiptEntity, useGetReceipts } from '../functions/firebase'
import { DateTime } from 'luxon'
import { Routes } from '../core/BaseRouter'
import UnstyledLink from '../components/UnstyledLink'
import { Container, ListItemButton, ListItemText } from '@mui/material'
import Typography from '@mui/material/Typography'
import ListItem from '@mui/material/ListItem'
import List from '@mui/material/List'
import LoadingContainer from '../components/LoadingContainer'

const ReceiptsPage: FunctionComponent = () => {
  const { receipts, isLoading } = useGetReceipts()

  const receiptsSorted = useMemo(() => receipts.sort((a, b) => b.date - a.date), [receipts])

  return (
    <Container>
      <LoadingContainer isLoading={isLoading}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              maxWidth: 600,
              gap: 10,
            }}
          >
            <Typography variant={'h3'} sx={{ mb: 2 }}>
              Receipts
            </Typography>
            <List sx={{ bgcolor: 'background.paper' }}>
              {receiptsSorted.map((receipt) => (
                <ReceiptInfoRow key={receipt.id} receipt={receipt} />
              ))}
            </List>
          </div>
        </div>
      </LoadingContainer>
    </Container>
  )
}

export default ReceiptsPage

const ReceiptInfoRow: FunctionComponent<{ receipt: ReceiptEntity }> = ({ receipt }) => {
  const dt = DateTime.fromMillis(receipt.date)
  return (
    <UnstyledLink to={Routes.receipts.info.route({ receiptId: receipt.id })}>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary={receipt.title} secondary={dt.toLocaleString(DateTime.DATE_MED)} />
        </ListItemButton>
      </ListItem>
    </UnstyledLink>
  )
}
