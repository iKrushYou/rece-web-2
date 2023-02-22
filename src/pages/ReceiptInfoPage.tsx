import React, { FunctionComponent } from 'react'
import { ReceiptInfoPathProps, ReceiptInfoTabs, Routes } from '../core/BaseRouter'
import { updateReceiptValue, useGetReceipt } from '../functions/firebase'
import { ButtonBase, Container, TextField } from '@mui/material'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LoadingContainer from '../components/LoadingContainer'
import Typography from '@mui/material/Typography'
import { DateTime } from 'luxon'
import Box from '@mui/material/Box'
import useEditTextModal from '../components/useEditTextModal'
import ReceiptInfoItemsTab from './ReceiptInfoItemsTab'
import { Redirect, Route, Switch, useHistory, useParams } from 'react-router-dom';
import ReceiptInfoPeopleTab from './ReceiptInfoPeopleTab'

const ReceiptInfoPage: FunctionComponent = () => {
  const { receiptId, tab } = useParams<ReceiptInfoPathProps>()
  const history = useHistory()

  const { receipt, people, isLoading, subTotal } = useGetReceipt(receiptId)

  const dt = DateTime.fromMillis(receipt?.date ?? 0)

  const { EditTextModal, showEditTextModal } = useEditTextModal()

  return (
    <Container sx={{ marginBottom: '50px' }}>
      <LoadingContainer isLoading={isLoading}>
        {receipt && (
          <Box>
            <Box sx={{ marginBottom: '20px' }}>
              <Typography variant={'h3'} sx={{ position: 'relative' }}>
                <ButtonBase
                  sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                  onClick={() =>
                    showEditTextModal({
                      setValue: (value) => updateReceiptValue(receiptId, 'title', value),
                      title: 'Edit Receipt Name',
                      value: receipt.title,
                    })
                  }
                />
                {receipt.title}
              </Typography>
              <TextField
                id='date'
                label='Date'
                type='date'
                sx={{ width: 220 }}
                InputLabelProps={{
                  shrink: true,
                }}
                value={dt.toFormat('yyyy-MM-dd')}
                onChange={async (e) => {
                  const newDate = DateTime.fromFormat(e.target.value, 'yyyy-MM-dd').toMillis()
                  console.log(e.target.value, DateTime.fromFormat('yyyy-MM-dd', e.target.value), newDate)
                  await updateReceiptValue(receiptId, 'date', newDate)
                }}
                variant={'standard'}
              />
            </Box>
            <Tabs
              value={ReceiptInfoTabs.indexOf(tab ?? 'items')}
              onChange={(event, value) => history.push(Routes.receipts.info.route({ receiptId, tab: ReceiptInfoTabs[value] }))}
              indicatorColor="primary"
              textColor="primary"
              centered
              style={{ marginBottom: 20 }}
            >
              {ReceiptInfoTabs.map((tab) => (
                <Tab key={tab} label={tab} />
              ))}
            </Tabs>
            <Switch>
              <Route path={Routes.receipts.info.tabPath({ tab: 'items' })} exact component={ReceiptInfoItemsTab} />
              <Route path={Routes.receipts.info.tabPath({ tab: 'people' })} exact component={ReceiptInfoPeopleTab} />
              <Redirect to={Routes.receipts.info.route({ receiptId, tab: 'items' })} from={Routes.receipts.info.path} />
            </Switch>
          </Box>
        )}
      </LoadingContainer>
      {EditTextModal}
    </Container>
  )
}

export default ReceiptInfoPage
