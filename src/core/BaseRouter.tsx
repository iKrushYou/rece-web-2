import { FunctionComponent } from 'react';
import { generatePath, Redirect, Route, Switch } from 'react-router-dom';
import ReceiptsPage from '../pages/ReceiptsPage';
import ReceiptInfoPage from '../pages/ReceiptInfoPage';

const RECEIPTS_PATH = '/receipts';
const receipts = {
  path: RECEIPTS_PATH,
  route: (): string => RECEIPTS_PATH,
};

export type ReceiptInfoPathProps = {
  receiptId: string;
  tab?: ReceiptInfoTab;
};
export const ReceiptInfoTabs = ['items', 'people'] as const;
export type ReceiptInfoTab = (typeof ReceiptInfoTabs)[number];
const RECEIPT_INFO_PATH = '/receipts/:receiptId/:tab?';
const receiptInfo = {
  path: RECEIPT_INFO_PATH,
  route: (params: ReceiptInfoPathProps): string => generatePath(RECEIPT_INFO_PATH, params),
  tabPath: ({ tab }: Required<Pick<ReceiptInfoPathProps, 'tab'>>): string => RECEIPT_INFO_PATH.replace(':tab?', tab),
};

export const Routes = {
  receipts: {
    ...receipts,
    info: receiptInfo,
  },
};

const BaseRouter: FunctionComponent = () => {
  return (
    <Switch>
      <Redirect to={Routes.receipts.path} from={'/'} exact />
      <Route path={Routes.receipts.path} exact component={ReceiptsPage} />
      <Route path={Routes.receipts.info.path} component={ReceiptInfoPage} />
    </Switch>
  );
};

export default BaseRouter;
