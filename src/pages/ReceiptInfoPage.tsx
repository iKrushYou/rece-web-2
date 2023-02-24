import React, { FunctionComponent } from 'react';
import { ReceiptInfoPathProps, ReceiptInfoTabs, Routes } from '../core/BaseRouter';
import { updateReceiptProperty, useGetReceipt } from '../functions/firebase';
import { ButtonBase, Container, TextField } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LoadingContainer from '../components/LoadingContainer';
import Typography from '@mui/material/Typography';
import { DateTime } from 'luxon';
import Box from '@mui/material/Box';
import useEditTextModal from '../components/useEditTextModal';
import ReceiptInfoItemsTab from './ReceiptInfoItemsTab';
import { Redirect, Route, Switch, useHistory, useParams } from 'react-router-dom';
import ReceiptInfoPeopleTab from './ReceiptInfoPeopleTab';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import IconButton from '@mui/material/IconButton';

const ReceiptInfoPage: FunctionComponent = () => {
  const { receiptId, tab } = useParams<ReceiptInfoPathProps>();
  const history = useHistory();

  const { receipt, isLoading } = useGetReceipt(receiptId);
  const dt = DateTime.fromMillis(receipt?.date ?? 0);

  const { EditTextModal, showEditTextModal } = useEditTextModal();

  return (
    <Container sx={{ marginBottom: '160px' }}>
      <LoadingContainer isLoading={isLoading}>
        {receipt && (
          <Box>
            <Box sx={{ marginBottom: '20px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: '8px' }}>
                <ButtonBase
                  sx={{ flex: 1, textAlign: 'inherit' }}
                  onClick={() =>
                    showEditTextModal({
                      setValue: (value) => updateReceiptProperty(receiptId, 'title', value),
                      title: 'Edit Receipt Name',
                      value: receipt.title,
                    })
                  }
                  disabled={!!receipt.locked}
                >
                  <Typography variant={'h3'} sx={{ width: '100%' }}>
                    {receipt.title}
                  </Typography>
                </ButtonBase>
                <Box>
                  <IconButton onClick={() => updateReceiptProperty(receiptId, 'locked', !receipt.locked)}>
                    {receipt.locked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Box>
              </Box>
              <TextField
                id="date"
                label="Date"
                type="date"
                sx={{ width: 220 }}
                InputLabelProps={{
                  shrink: true,
                }}
                value={dt.toFormat('yyyy-MM-dd')}
                onChange={async (e) => {
                  const newDate = DateTime.fromFormat(e.target.value, 'yyyy-MM-dd').toMillis();
                  await updateReceiptProperty(receiptId, 'date', newDate);
                }}
                variant={'standard'}
                disabled={!!receipt.locked}
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
  );
};

export default ReceiptInfoPage;
